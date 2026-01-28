"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Droplet, 
  Ruler, 
  Weight,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";

type ProfileData = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  blood_group: string | null;
  date_of_birth: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  profile_picture: string | null;
  is_complete: boolean;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);

  const [form, setForm] = useState<ProfileData>({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    blood_group: "",
    date_of_birth: "",
    age: null,
    height_cm: null,
    weight_kg: null,
    profile_picture: null,
    is_complete: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const token = getCookie("pcos_token");
      const res = await fetch("http://127.0.0.1:8000/api/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setForm({
        ...data,
        phone: data.phone || "",
        address: data.address || "",
        blood_group: data.blood_group || "",
        date_of_birth: data.date_of_birth || "",
      });
      
      if (data.profile_picture) {
        setProfilePicPreview(data.profile_picture);
      }
      
      setIsNewUser(!data.is_complete);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Auto-calculate age from date of birth
    if (name === "date_of_birth" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setForm(prev => ({ ...prev, age }));
    }
  }

  async function handleProfilePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingPic(true);
    setError(null);

    try {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicPreview(base64String);
        setForm(prev => ({ ...prev, profile_picture: base64String }));
        setUploadingPic(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setUploadingPic(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
      setUploadingPic(false);
    }
  }

  function removeProfilePic() {
    setProfilePicPreview(null);
    setForm(prev => ({ ...prev, profile_picture: null }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("pcos_token");
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
        address: form.address || null,
        blood_group: form.blood_group || null,
        date_of_birth: form.date_of_birth || null,
        age: form.age,
        height_cm: form.height_cm ? parseFloat(form.height_cm.toString()) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg.toString()) : null,
        profile_picture: form.profile_picture,
      };

      const res = await fetch("http://127.0.0.1:8000/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await res.json();
      setSuccess(true);
      
      // Redirect to profile page or assess page based on user status
      setTimeout(() => {
        if (isNewUser && data.is_complete) {
          router.push("/assess");
        } else {
          router.push("/profile");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  // Calculate BMI
  const bmi = form.height_cm && form.weight_kg 
    ? (form.weight_kg / Math.pow(form.height_cm / 100, 2)).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-purple-50/30 py-12 px-4">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teal-600 to-purple-600 rounded-2xl text-white shadow-lg">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isNewUser ? "Complete Your Profile" : "Edit Profile"}
              </h1>
              <p className="text-slate-600 mt-1">
                {isNewUser 
                  ? "Let's get to know you better for personalized care" 
                  : "Update your personal and medical information"}
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
            <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-emerald-900 font-semibold text-sm">Profile Saved Successfully!</p>
              <p className="text-emerald-700 text-sm mt-0.5">Redirecting...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 font-semibold text-sm">Error</p>
              <p className="text-red-700 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Camera size={24} />
                Profile Picture
              </h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center gap-4">
                {/* Profile Picture Preview */}
                <div className="relative">
                  {profilePicPreview ? (
                    <div className="relative group">
                      <img
                        src={profilePicPreview}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-teal-100 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeProfilePic}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-100 to-purple-100 flex items-center justify-center border-4 border-slate-100 shadow-lg">
                      <User size={48} className="text-slate-400" />
                    </div>
                  )}
                  {uploadingPic && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                    disabled={uploadingPic}
                  />
                  <div className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-2 border-2 border-slate-200 hover:border-slate-300">
                    <Camera size={18} />
                    <span>{profilePicPreview ? "Change Photo" : "Upload Photo"}</span>
                  </div>
                </label>
                <p className="text-xs text-slate-500 text-center">
                  JPG, PNG or GIF • Max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User size={24} />
                Personal Information
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User size={16} className="text-teal-600" />
                    First Name *
                  </label>
                  <input
                    name="first_name"
                    type="text"
                    value={form.first_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('first_name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-200 text-slate-900 bg-white ${
                      focusedField === 'first_name' ? 'scale-[1.02]' : ''
                    }`}
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User size={16} className="text-teal-600" />
                    Last Name *
                  </label>
                  <input
                    name="last_name"
                    type="text"
                    value={form.last_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('last_name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-200 text-slate-900 bg-white ${
                      focusedField === 'last_name' ? 'scale-[1.02]' : ''
                    }`}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar size={16} className="text-teal-600" />
                    Date of Birth *
                  </label>
                  <input
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-200 text-slate-900 bg-white"
                  />
                </div>

                {/* Age (Auto-calculated) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    Age
                  </label>
                  <input
                    type="number"
                    value={form.age || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">Auto-calculated from date of birth</p>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone size={16} className="text-teal-600" />
                  Phone Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-200 text-slate-900 bg-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin size={16} className="text-teal-600" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-200 text-slate-900 bg-white resize-none"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
            </div>
          </div>

          {/* Medical Information Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Droplet size={24} />
                Medical Information
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Blood Group */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Droplet size={16} className="text-purple-600" />
                    Blood Group *
                  </label>
                  <select
                    name="blood_group"
                    value={form.blood_group || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 text-slate-900 bg-white"
                  >
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Ruler size={16} className="text-purple-600" />
                    Height (cm) *
                  </label>
                  <input
                    name="height_cm"
                    type="number"
                    step="0.1"
                    value={form.height_cm || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 text-slate-900 bg-white"
                    placeholder="165"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Weight size={16} className="text-purple-600" />
                    Weight (kg) *
                  </label>
                  <input
                    name="weight_kg"
                    type="number"
                    step="0.1"
                    value={form.weight_kg || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 text-slate-900 bg-white"
                    placeholder="60"
                  />
                </div>
              </div>

              {/* BMI Display */}
              {bmi && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Body Mass Index (BMI)</p>
                      <p className="text-xs text-purple-700 mt-1">Auto-calculated from height and weight</p>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">{bmi}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>{isNewUser ? "Complete Profile" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
