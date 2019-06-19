export class AttachmentCustom {
  id: number;
  type: string;
  name: string;
  content: Int8Array;
  photoSource: string;

  static getNewWithId(id: number): AttachmentCustom {
    const attachment = new AttachmentCustom();
    attachment.id = id;
    return attachment;
  }
}
