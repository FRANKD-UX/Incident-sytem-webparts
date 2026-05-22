export interface Attachment {
  id: string;
  incidentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  category: AttachmentCategory;
  isProofOfUptime: boolean;
  url: string;
  thumbnailUrl?: string;
  metadata: AttachmentMetadata;
}

export interface AttachmentMetadata {
  uploadedFromDepartment: string;
  chainStepId?: string;
  checklistItemId?: string;
  description?: string;
  tags: string[];
}

export type AttachmentCategory =
  | "EVIDENCE"
  | "PROOF_OF_UPTIME"
  | "SCREENSHOT"
  | "DOCUMENT"
  | "OTHER";

export interface AttachmentUpload {
  file: File;
  incidentId: string;
  category: AttachmentCategory;
  isProofOfUptime: boolean;
  metadata: Partial<AttachmentMetadata>;
}
