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
  Edit,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
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

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

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

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data);

      if (!data.is_complete) {
        router.push("/profile/edit");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const bmi =
    profile?.height_cm && profile?.weight_kg
      ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex gap-3 max-w-md">
          <AlertCircle className="text-red-600 mt-1" />
          <div>
            <p className="font-semibold text-red-900">Unable to load profile</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={() => router.push("/profile/edit")}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        </div>

        {/* PROFILE HEADER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-teal-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                {" "}
                <User size={40} className="text-slate-600" />{" "}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-slate-600 flex items-center gap-2 mt-1">
                <Mail size={16} /> {profile.email}
              </p>
            </div>

            {profile.is_complete && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="text-green-600" size={18} />
                <span className="text-sm font-semibold text-green-700">
                  Profile Complete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PERSONAL INFO */}
        <Section title="Personal Information">
          <InfoGrid>
            <Info label="Date of Birth" icon={<Calendar size={16} />}>
              {profile.date_of_birth
                ? new Date(profile.date_of_birth).toLocaleDateString()
                : "Not provided"}
            </Info>

            <Info label="Age" icon={<Calendar size={16} />}>
              {profile.age ? `${profile.age} years` : "—"}
            </Info>

            <Info label="Phone" icon={<Phone size={16} />}>
              {profile.phone || "Not provided"}
            </Info>

            <Info label="Address" icon={<MapPin size={16} />}>
              {profile.address || "Not provided"}
            </Info>
          </InfoGrid>
        </Section>

        {/* MEDICAL INFO */}
        <Section title="Medical Information">
          <InfoGrid>
            <Info label="Blood Group" icon={<Droplet size={16} />}>
              {profile.blood_group || "Not provided"}
            </Info>

            <Info label="Height" icon={<Ruler size={16} />}>
              {profile.height_cm ? `${profile.height_cm} cm` : "—"}
            </Info>

            <Info label="Weight" icon={<Weight size={16} />}>
              {profile.weight_kg ? `${profile.weight_kg} kg` : "—"}
            </Info>
          </InfoGrid>

          {bmi && (
            <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-900">BMI</p>
                <p className="text-xs text-teal-700">
                  Calculated from height and weight
                </p>
              </div>
              <p className="text-3xl font-bold text-teal-600">{bmi}</p>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

/* =================== UI HELPERS =================== */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  );
}

function Info({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
        <span className="text-teal-600">{icon}</span>
        {label}
      </div>
      <div className="text-slate-900 font-medium">{children}</div>
    </div>
  );
}