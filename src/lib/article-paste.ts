/**
 * Tidies HTML pasted into the article editor. Word writes lists as ordinary
 * paragraphs with an mso-list style and a typed bullet, so those become real
 * lists here. Headings move onto the levels the editor has (the page title is
 * the only h1), and pictures Word points at on the writer's own disk are
 * dropped because a browser cannot read them. `keepImage` can drop more.
 */
export function cleanPastedHtml(
  html: string,
  { keepImage }: { keepImage?: (src: string) => boolean } = {},
): { html: string; droppedImages: number } {
  if (typeof DOMParser === "undefined") {
    return { html, droppedImages: 0 };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  body.querySelectorAll("style, meta, link, title, xml, script").forEach((node) => node.remove());
  removeComments(doc);

  if (/mso-list|class="?Mso|urn:schemas-microsoft-com/i.test(html)) {
    convertWordLists(doc);
    body.querySelectorAll("o\\:p").forEach((node) => node.replaceWith(...Array.from(node.childNodes)));
  }

  for (const heading of Array.from(body.querySelectorAll("h1, h5, h6"))) {
    const level = heading.tagName === "H1" ? "h2" : "h4";
    const replacement = doc.createElement(level);
    replacement.append(...Array.from(heading.childNodes));
    const style = heading.getAttribute("style");
    if (style) {
      replacement.setAttribute("style", style);
    }
    heading.replaceWith(replacement);
  }

  let droppedImages = 0;
  for (const image of Array.from(body.querySelectorAll("img"))) {
    const src = image.getAttribute("src") ?? "";
    if (!/^https?:\/\//i.test(src) || (keepImage && !keepImage(src))) {
      image.remove();
      droppedImages += 1;
    }
  }
  // Word also sends VML shapes for its pictures.
  body.querySelectorAll("v\\:shape, v\\:imagedata").forEach((node) => node.remove());

  return { html: body.innerHTML, droppedImages };
}

function removeComments(doc: Document) {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) {
    comments.push(walker.currentNode);
  }
  comments.forEach((node) => node.parentNode?.removeChild(node));
}

function listStyle(element: Element) {
  const style = element.getAttribute("style") ?? "";
  const match = style.match(/mso-list:\s*(l\d+)\s+level(\d+)/i);
  return match ? { level: Number(match[2]) } : null;
}

function convertWordLists(doc: Document) {
  const items = Array.from(doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6")).filter((element) =>
    listStyle(element),
  );

  let stack: { list: HTMLElement; level: number }[] = [];
  let previous: Element | null = null;

  for (const item of items) {
    const level = listStyle(item)?.level ?? 1;

    // The typed bullet or number sits in a span Word marks to be ignored.
    const markers = Array.from(item.querySelectorAll('[style*="mso-list:Ignore"], [style*="mso-list: Ignore"]'));
    const markerText = markers.map((marker) => marker.textContent ?? "").join("").replace(/\s| /g, "");
    markers.forEach((marker) => marker.remove());
    const ordered = /^\(?[0-9a-zA-Z]{1,4}[.)]$/.test(markerText);
    const tag = ordered ? "ol" : "ul";

    const continues = previous !== null && nextElement(previous) === item && stack.length > 0;
    if (!continues) {
      const root = doc.createElement(tag);
      item.before(root);
      stack = [{ list: root, level: 1 }];
    }

    while (level > stack[stack.length - 1].level) {
      const top = stack[stack.length - 1];
      let parent = top.list.lastElementChild as HTMLElement | null;
      if (!parent) {
        parent = doc.createElement("li");
        top.list.append(parent);
      }
      const nested = doc.createElement(tag);
      parent.append(nested);
      stack.push({ list: nested, level: top.level + 1 });
    }
    while (level < stack[stack.length - 1].level && stack.length > 1) {
      stack.pop();
    }

    const listItem = doc.createElement("li");
    const paragraph = doc.createElement("p");
    paragraph.append(...Array.from(item.childNodes));
    listItem.append(paragraph);
    stack[stack.length - 1].list.append(listItem);

    // The list now stands where the paragraphs were, so the next item follows
    // on when it is the list's next sibling.
    previous = stack[0].list;
    item.remove();
  }
}

function nextElement(element: Element) {
  let node = element.nextSibling;
  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      return null;
    }
    node = node.nextSibling;
  }
  return node as Element | null;
}
