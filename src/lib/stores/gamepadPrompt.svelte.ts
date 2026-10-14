function createGamepadPrompt() {
  let visible = $state(false);

  return {
    get visible() {
      return visible;
    },
    set visible(value: boolean) {
      visible = value;
    },
  };
}

export const gamepadPrompt = createGamepadPrompt();
