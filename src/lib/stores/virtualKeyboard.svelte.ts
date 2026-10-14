export type EditableField = HTMLInputElement | HTMLTextAreaElement;

function createVirtualKeyboard() {
  let target = $state.raw<EditableField | null>(null);

  return {
    get target() {
      return target;
    },
    open(field: EditableField) {
      target = field;
    },
    close() {
      target = null;
    },
  };
}

export const virtualKeyboard = createVirtualKeyboard();
