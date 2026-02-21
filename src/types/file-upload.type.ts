export interface FileUploadResponse {
    objectKey: string;
    previewUrl: string;
}

export interface GetPresignedUrlRequest {
    objectKey: string;
}