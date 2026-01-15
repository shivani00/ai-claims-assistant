export default function UploadPanel({ onUpload }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
      📎 Upload files
      <input
        type="file"
        multiple
        hidden
        onChange={e => onUpload([...e.target.files])}
      />
    </label>
  );
}
