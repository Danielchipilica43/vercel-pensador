import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ EXPORTAR a função uploadImage
export async function uploadImage(
  file: Buffer | string,
  folder: string = 'escolar',
  options: any = {}
) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        ...(options.transformation || []),
      ],
      ...options,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Erro no upload Cloudinary:', error);
    throw error;
  }
}

// ✅ EXPORTAR a função deleteImage
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    throw error;
  }
}

// ✅ EXPORTAR a função getOptimizedImageUrl
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
) {
  const {
    width = 800,
    height = 600,
    crop = 'limit',
    quality = 'auto:good',
    format = 'auto',
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: format },
    ],
  });
}

// ✅ EXPORTAR a função getThumbnailUrl
export function getThumbnailUrl(publicId: string, size: number = 200) {
  return cloudinary.url(publicId, {
    transformation: [
      { width: size, height: size, crop: 'fill' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
}

// Exportar o cloudinary configurado para uso direto se necessário
export { cloudinary };

// Exportar tudo como um objeto
export default {
  uploadImage,
  deleteImage,
  getOptimizedImageUrl,
  getThumbnailUrl,
  cloudinary,
};