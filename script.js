"use strict";
const form = document.getElementById('resume-form');
const resumeOutput = document.getElementById('resume-output');
const personalInfoOutput = document.getElementById('personal-info-output');
const educationOutput = document.getElementById('education-output');
const workExperienceOutput = document.getElementById('work-experience-output');
const skillsOutput = document.getElementById('skills-output');
const shareLink = document.getElementById('share-link');
const resumeUrl = document.getElementById('resume-url');
const copyLinkButton = document.getElementById('copy-link');
const downloadButton = document.getElementById('download-resume');
function generateEditableSection(title, content) {
    return `
    <div class="editable-section">
      <h2>${title}</h2>
      <p class="editable-content" contenteditable="false">${content}</p>
      <div class="button-group">
        <button class="edit-button">Edit</button>
        <button class="save-button hidden">Save</button>
      </div>
    </div>
  `;
}
function generateEditableListSection(title, items) {
    const listItems = items.map(item => `<li>${item.trim()}</li>`).join('');
    return `
    <div class="editable-section">
      <h2>${title}</h2>
      <ul class="editable-content" contenteditable="false">
        ${listItems}
      </ul>
      <div class="button-group">
        <button class="edit-button">Edit</button>
        <button class="save-button hidden">Save</button>
      </div>
    </div>
  `;
}
function generatePersonalInfoSectionWithEdit(name, email, phone, profilePicSrc) {
    let imgHtml = '';
    if (profilePicSrc) {
        imgHtml = `
      <img src="${profilePicSrc}" alt="Profile Picture" id="profile-pic-output" />
      <div class="button-group">
        <button class="edit-profile-pic-button">Edit Picture</button>
      </div>
    `;
    }
    return `
    <div class="editable-section" id="personal-info-section">
      <h2>Personal Information</h2>
      ${imgHtml}
      <p class="editable-content" contenteditable="false"><strong>Name:</strong> ${name}</p>
      <p class="editable-content" contenteditable="false"><strong>Email:</strong> ${email}</p>
      <p class="editable-content" contenteditable="false"><strong>Phone:</strong> ${phone}</p>
      <div class="button-group">
        <button class="edit-button">Edit</button>
        <button class="save-button hidden">Save</button>
      </div>
    </div>
  `;
}
form.addEventListener('submit', (event) => {
    var _a;
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const education = document.getElementById('education').value;
    const workExperience = document.getElementById('work-experience').value;
    const skills = document.getElementById('skills').value.split(',');
    const profilePicInput = document.getElementById('profile-pic');
    const profilePicFile = (_a = profilePicInput.files) === null || _a === void 0 ? void 0 : _a[0];
    const handleProfilePic = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function () {
                reject('Error reading profile picture.');
            };
            reader.readAsDataURL(file);
        });
    };
    const populateResume = (profilePicSrc) => {
        personalInfoOutput.innerHTML = generatePersonalInfoSectionWithEdit(name, email, phone, profilePicSrc);
        educationOutput.innerHTML = generateEditableSection('Education', education);
        workExperienceOutput.innerHTML = generateEditableSection('Work Experience', workExperience);
        skillsOutput.innerHTML = generateEditableListSection('Skills', skills);
        resumeOutput.classList.remove('hidden');
        const uniqueUrl = `${window.location.origin}/resume`;
        resumeUrl.value = uniqueUrl;
        shareLink.classList.remove('hidden');
        form.reset();
    };
    if (profilePicFile) {
        handleProfilePic(profilePicFile).then((profilePicSrc) => {
            populateResume(profilePicSrc);
        }).catch((error) => {
            console.error(error);
            populateResume();
        });
    }
    else {
        populateResume();
    }
});
function toggleEditSave(button, saveButton, contentElement) {
    if (button.textContent === 'Edit') {
        contentElement.setAttribute('contenteditable', 'true');
        contentElement.focus();
        button.classList.add('hidden');
        saveButton.classList.remove('hidden');
    }
}
function saveContent(button, editButton, contentElement) {
    if (button.textContent === 'Save') {
        contentElement.setAttribute('contenteditable', 'false');
        button.classList.add('hidden');
        editButton.classList.remove('hidden');
    }
}
function downloadResume() {
    const resumeHtml = resumeOutput.innerHTML;
    const originalHtml = document.documentElement.innerHTML;
    document.documentElement.innerHTML = resumeHtml;
    window.print();
    document.documentElement.innerHTML = originalHtml;
}
document.addEventListener('click', function (event) {
    const target = event.target;
    if (target.classList.contains('edit-button')) {
        const button = target;
        const parentSection = button.closest('.editable-section');
        if (parentSection) {
            const saveButton = parentSection.querySelector('.save-button');
            const contentElement = parentSection.querySelector('.editable-content');
            if (saveButton && contentElement) {
                toggleEditSave(button, saveButton, contentElement);
            }
        }
    }
    if (target.classList.contains('save-button')) {
        const button = target;
        const parentSection = button.closest('.editable-section');
        if (parentSection) {
            const editButton = parentSection.querySelector('.edit-button');
            const contentElement = parentSection.querySelector('.editable-content');
            if (editButton && contentElement) {
                saveContent(button, editButton, contentElement);
            }
        }
    }
    if (target.classList.contains('edit-profile-pic-button')) {
        const button = target;
        const parentSection = button.closest('.editable-section');
        if (parentSection) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (e) => {
                const input = e.target;
                if (input.files && input.files[0]) {
                    const file = input.files[0];
                    const reader = new FileReader();
                    reader.onload = function () {
                        const imgElement = parentSection.querySelector('#profile-pic-output');
                        if (imgElement) {
                            imgElement.src = reader.result;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            fileInput.click();
        }
    }
    if (target.id === 'copy-link') {
        resumeUrl.select();
        document.execCommand('copy');
    }
    if (target.id === 'download-resume') {
        downloadResume();
    }
});
function generatePDF() {
    const doc = new jsPDF();
    // Get the resume content
    const resumeElement = document.getElementById('resume-output');
    // Adjust to fit PDF format
    doc.html(resumeElement, {
        callback: function (doc) {
            // Save the PDF
            doc.save('resume.pdf');
        },
        x: 10,
        y: 10,
        width: 180, // Set width to scale content properly
        windowWidth: document.body.scrollWidth,
    });
}
