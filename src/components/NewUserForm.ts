import { type UserProfile, UserService } from "../services/UserService";

let currentStep = 0;
let answers: Partial<UserProfile> = {};

const questions = [
  {
    id: "name",
    label: "What is your name?",
    type: "text",
    placeholder: "John Doe",
  },
  {
    id: "email",
    label: "What is your email?",
    type: "text",
    placeholder: "john.doe@gmail.com",
  },
  {
    id: "workAddress",
    label: "What is your work address?",
    type: "text",
    placeholder: "insert address",
  },
];

export function renderUserSurvey(mount: HTMLElement) {
  const render = () => {
    const question = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;

    mount.innerHTML = `
      <div class="survey-container">
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
            <button type="submit">${isLastStep ? "Finish" : "Next"}</button>
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
      `#${question.id}`
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
  console.log("Survey Complete:", answers);
  // TODO!

  // 1. Save to a UserPreferencesService
  // 2. Change the window.location.hash to '#compare'
  window.location.hash = "#compare";
}
