import {v2 as cloudinary} from 'cloudinary';
cloudinary.config({ 
    cloud_name: 'ddexhab66',
    api_key: '229387996565341',
    api_secret: '7GnvXOEvjb-KeRaxSoF3GUE4z20' 
});

export const uploadStream = (buffer: any) => {
    return new Promise((resolve) => {
        cloudinary.uploader.upload_stream((error: any, uploadResult) => {
            return resolve(uploadResult);
        }).end(buffer);
    })
}