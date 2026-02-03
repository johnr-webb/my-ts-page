import { type UserProfile, UserService } from "../services/UserService";
import { AuthService } from "../services/AuthService";
import { navigateTo } from "../router";

let currentStep = 0;
let answers: Partial<UserProfile> = {};

const questions = [
  {
    id: "workAddress",
    label: "What is your work address?",
    type: "text",
    placeholder: "Enter your work address",
  },
];

export function renderUserSurvey(mount: HTMLElement) {
  // Check if user is authenticated
  const currentUser = AuthService.getCurrentUser();
  if (!currentUser) {
    mount.innerHTML = `
      <div class="survey-container">
        <p>Please sign in to set up your profile</p>
        <button id="signin-redirect-btn">Sign In</button>
      </div>
    `;

    // Add event listener for sign in redirect
    const signinBtn = mount.querySelector("#signin-redirect-btn");
    if (signinBtn) {
      signinBtn.addEventListener("click", () => navigateTo("/signin"));
    }
    return;
  }

  // Initialize answers with user data
  if (Object.keys(answers).length === 0) {
    answers = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
    };
  }

  const render = () => {
    const question = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;

    mount.innerHTML = `
      <div class="survey-container">
        <h2>Complete Your Profile</h2>
        <p>Hi ${currentUser.name}! Let's set up your work location to help you find the perfect apartment.</p>
        <p>Question ${currentStep + 1} of ${questions.length}</p>
        <form id="survey-form">
          <label>${question.label}</label>
          ${renderInput(question)}
          <div class="actions">
            ${
              currentStep > 0
                ? '<button type="button" id="prev-btn">Back</button>'
                : ""
            }
            <button type="submit">${isLastStep ? "Complete Setup" : "Next"}</button>
          </div>
        </form>
      </div>
    `;

    setupEventListeners(mount, isLastStep);
  };
  render();
}

function renderInput(q: any) {
  if (q.type === "select") {
    return `<select id="${q.id}">${q.options
      .map((o: string) => `<option value="${o}">${o}</option>`)
      .join("")}</select>`;
  }
  return `<input type="${q.type}" id="${q.id}" placeholder="${
    q.placeholder || ""
  }" required>`;
}

function setupEventListeners(mount: HTMLElement, isLastStep: boolean) {
  const form = mount.querySelector<HTMLFormElement>("#survey-form")!;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = questions[currentStep];
    const input = mount.querySelector<HTMLInputElement | HTMLSelectElement>(
      `#${question.id}`,
    )!;

    // Save answer
    answers[question.id as keyof UserProfile] = input.value as any;

    if (isLastStep) {
      handleFinalSubmit();
    } else {
      currentStep++;
      renderUserSurvey(mount); // Re-render for next question
    }
  });

  mount.querySelector("#prev-btn")?.addEventListener("click", () => {
    currentStep--;
    renderUserSurvey(mount);
  });
}

function handleFinalSubmit() {
  console.log("Profile setup complete:", answers);

  // Update the user profile with work address
  if (answers.id && answers.name && answers.email && answers.workAddress) {
    UserService.updateProfile(
      answers.id,
      answers.name,
      answers.email,
      answers.workAddress,
    );
  }

  localStorage.setItem("hasCompletedProfile", "yes");

  // Navigate to compare page
  navigateTo("/compare");
}
