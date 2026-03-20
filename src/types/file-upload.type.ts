export interface FileUploadResponse {
    objectKey: string;
    previewUrl: string;
    averageConfidence?: number;
}

export interface GetPresignedUrlRequest {
    objectKey: string;
}