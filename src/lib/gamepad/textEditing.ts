export type TextState = {
  value: string;
  start: number;
  end: number;
};

export function insertText({ value, start, end }: TextState, text: string): TextState {
  const caret = start + text.length;
  return { value: value.slice(0, start) + text + value.slice(end), start: caret, end: caret };
}

export function deleteBackward({ value, start, end }: TextState): TextState {
  if (start !== end) {
    return { value: value.slice(0, start) + value.slice(end), start, end: start };
  }

  if (start === 0) {
    return { value, start, end };
  }

  const characters = Array.from(value.slice(0, start));
  const removed = characters.pop() ?? "";
  const caret = start - removed.length;
  return { value: value.slice(0, caret) + value.slice(start), start: caret, end: caret };
}

export function moveCaret({ value, start, end }: TextState, direction: -1 | 1): TextState {
  const anchor = direction < 0 ? Math.min(start, end) : Math.max(start, end);
  const collapsed = start !== end;
  const caret = collapsed ? anchor : Math.min(value.length, Math.max(0, anchor + direction));
  return { value, start: caret, end: caret };
}
