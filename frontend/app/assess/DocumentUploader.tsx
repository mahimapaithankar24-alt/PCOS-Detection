// "use client";

// import { useState } from "react";
// import { parseDocument } from "@/lib/api";

// export default function DocumentUploader({
//   onParsed
// }: {
//   onParsed: (data: any) => void;
// }) {
//   const [loading, setLoading] = useState(false);

//   async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
//     if (!e.target.files?.[0]) return;

//     setLoading(true);
//     const fd = new FormData();
//     fd.append("file", e.target.files[0]);

//     try {
//       const parsed = await parseDocument(fd);
//       onParsed(parsed);
//     } catch (err) {
//       alert("Failed to parse document");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="border rounded p-4 bg-gray-50">
//       <label className="font-medium text-sm">
//         Upload Medical Report (PDF)
//       </label>

//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={handleUpload}
//         className="mt-2"
//       />

//       {loading && (
//         <p className="text-sm text-gray-600 mt-2">
//           Extracting values…
//         </p>
//       )}
//     </div>
//   );
// }
