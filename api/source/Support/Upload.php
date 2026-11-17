<?php

namespace Source\Support;

class Upload
{
    /**
     * @var string[] Permitted MIME types for images
     */
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    /**
     * @var string[] Permitted file extensions
     */
    private const ALLOWED_EXTENSIONS = ['jpg', 'png', 'webp'];

    /**
     * Maximum file size in bytes (5 MB)
     */
    private const MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * Upload directory for user photos
     */
    private const USER_PHOTO_DIR = 'uploads/users/';

    /**
     * Process and validate an uploaded image file.
     *
     * @param array<string, mixed> $file The $_FILES entry for the uploaded file
     * @param string               $directory Target directory relative to project root
     * @param int                  $maxSize   Optional custom max file size in bytes
     *
     * @return string The relative path to the saved file (e.g., "uploads/users/abc123.jpg")
     *
     * @throws \RuntimeException If validation fails or file cannot be saved
     */
    public static function image(array $file, string $directory = self::USER_PHOTO_DIR, int $maxSize = self::MAX_FILE_SIZE): string
    {
        // 1. Check upload error code
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new \RuntimeException(self::uploadErrorMessage($file['error'] ?? UPLOAD_ERR_NO_FILE));
        }

        // 2. Validate file size
        $fileSize = (int) ($file['size'] ?? 0);
        if ($fileSize === 0) {
            throw new \RuntimeException('Arquivo vazio.');
        }
        if ($fileSize > $maxSize) {
            throw new \RuntimeException('Arquivo excede o tamanho máximo permitido de ' . ($maxSize / 1024 / 1024) . ' MB.');
        }

        // 3. Validate MIME type (using finfo for security)
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new \RuntimeException('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
        }

        // 4. Validate extension
        $originalName = $file['name'] ?? '';
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if (!in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            throw new \RuntimeException('Extensão de arquivo não permitida. Use .jpg, .png ou .webp.');
        }

        // 5. Ensure upload directory exists
        $projectRoot = dirname(__DIR__, 3); // goes up to ReceitasWeb/
        $targetDir = $projectRoot . DIRECTORY_SEPARATOR . $directory;
        if (!is_dir($targetDir)) {
            if (!mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
                throw new \RuntimeException('Não foi possível criar o diretório de upload.');
            }
        }

        // 6. Generate unique filename (MD5 hash of time + random + original name)
        $uniqueName = md5(microtime(true) . random_bytes(16) . $originalName) . '.' . $extension;
        $targetPath = $targetDir . DIRECTORY_SEPARATOR . $uniqueName;

        // 7. Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new \RuntimeException('Falha ao mover o arquivo enviado.');
        }

        // 8. Set secure permissions
        chmod($targetPath, 0644);

        // 9. Return relative path for storage in database
        // Ensure directory ends with slash
        $directory = rtrim($directory, '/') . '/';
        return $directory . $uniqueName;
    }

    /**
     * Delete a previously uploaded file.
     *
     * @param string $relativePath Relative path from project root (e.g., "uploads/users/abc123.jpg")
     * @return bool True if file was deleted or didn't exist
     */
    public static function delete(string $relativePath): bool
    {
        if (empty($relativePath)) {
            return true;
        }

        $projectRoot = dirname(__DIR__, 3);
        $fullPath = $projectRoot . DIRECTORY_SEPARATOR . $relativePath;

        // Security: ensure path is within uploads directory
        $uploadsRoot = realpath($projectRoot . DIRECTORY_SEPARATOR . 'uploads');
        $targetPath = realpath($fullPath);

        if ($uploadsRoot === false || $targetPath === false) {
            return false;
        }

        if (!str_starts_with($targetPath, $uploadsRoot)) {
            return false; // Path traversal attempt
        }

        if (is_file($targetPath)) {
            return unlink($targetPath);
        }

        return true;
    }

    /**
     * Get human-readable message for upload error codes.
     */
    private static function uploadErrorMessage(int $errorCode): string
    {
        return match ($errorCode) {
            UPLOAD_ERR_INI_SIZE => 'O arquivo excede o limite de upload definido no php.ini.',
            UPLOAD_ERR_FORM_SIZE => 'O arquivo excede o limite de upload definido no formulário.',
            UPLOAD_ERR_PARTIAL => 'O upload do arquivo foi feito parcialmente.',
            UPLOAD_ERR_NO_FILE => 'Nenhum arquivo foi enviado.',
            UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária ausente no servidor.',
            UPLOAD_ERR_CANT_WRITE => 'Falha ao escrever arquivo no disco.',
            UPLOAD_ERR_EXTENSION => 'Uma extensão PHP interrompeu o upload.',
            default => 'Erro desconhecido no upload.',
        };
    }
}