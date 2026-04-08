const CLOUD_NAME = "dszpdywpu";
const UPLOAD_PRESET = "football_videos";

export async function cloudinaryUpload(file: File, folder = "forum"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `vnfootball/${folder}`);

  const resourceType = file.type.startsWith("video") ? "video" : "image";
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload thất bại");
  const data = await res.json();
  return data.secure_url;
}
