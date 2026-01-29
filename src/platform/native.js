export const notify = (title, body) => {
  window.native?.notify(title, body);
};
