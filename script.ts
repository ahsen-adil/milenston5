const form = document.getElementById('resume-form') as HTMLFormElement;
const resumeOutput = document.getElementById('resume-output') as HTMLDivElement;
const personalInfoOutput = document.getElementById('personal-info-output') as HTMLElement;
const educationOutput = document.getElementById('education-output') as HTMLElement;
const workExperienceOutput = document.getElementById('work-experience-output') as HTMLElement;
const skillsOutput = document.getElementById('skills-output') as HTMLElement;
const shareLink = document.getElementById('share-link') as HTMLDivElement;
const resumeUrl = document.getElementById('resume-url') as HTMLInputElement;
const copyLinkButton = document.getElementById('copy-link') as HTMLButtonElement;
const downloadButton = document.getElementById('download-resume') as HTMLButtonElement;

function generateEditableSection(title: string, content: string): string {
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

function generateEditableListSection(title: string, items: string[]): string {
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

function generatePersonalInfoSectionWithEdit(name: string, email: string, phone: string, profilePicSrc?: string): string {
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
  event.preventDefault();

  const name = (document.getElementById('name') as HTMLInputElement).value;
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const phone = (document.getElementById('phone') as HTMLInputElement).value;
  const education = (document.getElementById('education') as HTMLInputElement).value;
  const workExperience = (document.getElementById('work-experience') as HTMLTextAreaElement).value;
  const skills = (document.getElementById('skills') as HTMLInputElement).value.split(',');
  const profilePicInput = document.getElementById('profile-pic') as HTMLInputElement;
  const profilePicFile = profilePicInput.files?.[0];

  const handleProfilePic = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result as string);
      };
      reader.onerror = function () {
        reject('Error reading profile picture.');
      };
      reader.readAsDataURL(file);
    });
  };

  const populateResume = (profilePicSrc?: string) => {
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
  } else {
    populateResume();
  }
});

function toggleEditSave(button: HTMLButtonElement, saveButton: HTMLButtonElement, contentElement: HTMLElement) {
  if (button.textContent === 'Edit') {
    contentElement.setAttribute('contenteditable', 'true');
    contentElement.focus();
    button.classList.add('hidden');
    saveButton.classList.remove('hidden');
  }
}

function saveContent(button: HTMLButtonElement, editButton: HTMLButtonElement, contentElement: HTMLElement) {
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
  const target = event.target as HTMLElement;

  if (target.classList.contains('edit-button')) {
    const button = target as HTMLButtonElement;
    const parentSection = button.closest('.editable-section');
    if (parentSection) {
      const saveButton = parentSection.querySelector('.save-button') as HTMLButtonElement;
      const contentElement = parentSection.querySelector('.editable-content') as HTMLElement;
      if (saveButton && contentElement) {
        toggleEditSave(button, saveButton, contentElement);
      }
    }
  }

  if (target.classList.contains('save-button')) {
    const button = target as HTMLButtonElement;
    const parentSection = button.closest('.editable-section');
    if (parentSection) {
      const editButton = parentSection.querySelector('.edit-button') as HTMLButtonElement;
      const contentElement = parentSection.querySelector('.editable-content') as HTMLElement;
      if (editButton && contentElement) {
        saveContent(button, editButton, contentElement);
      }
    }
  }

  if (target.classList.contains('edit-profile-pic-button')) {
    const button = target as HTMLButtonElement;
    const parentSection = button.closest('.editable-section');
    if (parentSection) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = function () {
            const imgElement = parentSection.querySelector('#profile-pic-output') as HTMLImageElement;
            if (imgElement) {
              imgElement.src = reader.result as string;
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



  