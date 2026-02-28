import React from "react";
import {
  Heart,
  Users,
  Award,
  Hospital,
  ShieldCheck,
  Stethoscope,
  HandHeart,
  Calendar,
  Phone,
  Sparkles,
  Target,
  Activity,
  Globe,
  TrendingUp,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {

  /* ===================== STATS ===================== */

  const stats = [
    {
      number: "40+",
      label: "Years of Service",
      icon: <Award className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      number: "200+",
      label: "Doctors & Specialists",
      icon: <Stethoscope className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      number: "5 Lakh+",
      label: "Patients Served Annually",
      icon: <Users className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      number: "24/7",
      label: "Emergency Services",
      icon: <Hospital className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600"
    },
  ];

  /* ===================== CORE VALUES ===================== */

  const values = [
    {
      icon: <Heart className="h-10 w-10" />,
      title: "Patient-Centered Care",
      description:
        "We place patients first and provide compassionate, respectful, and ethical medical care to everyone.",
      color: "text-red-500 bg-red-50"
    },
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "Quality & Safety",
      description:
        "We follow strict clinical protocols and safety standards to ensure the highest quality treatment.",
      color: "text-blue-500 bg-blue-50"
    },
    {
      icon: <HandHeart className="h-10 w-10" />,
      title: "Community Service",
      description:
        "Committed to affordable and accessible healthcare for all sections of society.",
      color: "text-green-500 bg-green-50"
    }
  ];

  /* ===================== FACILITIES ===================== */

  const facilities = [
    {
      title: "Advanced Diagnostics",
      description:
        "CT Scan, X-Ray, Ultrasound, Pathology Labs, and other diagnostic services.",
      icon: <Activity className="h-8 w-8" />
    },
    {
      title: "Operation Theatres",
      description:
        "Well-equipped modular operation theatres for major and minor surgeries.",
      icon: <Target className="h-8 w-8" />
    },
    {
      title: "ICU & Emergency Care",
      description:
        "24/7 emergency department with ICU, ventilators, and trauma care.",
      icon: <Heart className="h-8 w-8" />
    }
  ];

  /* ===================== ACCREDITATION ===================== */

  const accreditations = [
    {
      name: "Government Hospital",
      description: "Under Govt. of NCT Delhi",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      name: "NABH Guidelines",
      description: "Patient Safety & Quality Care",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      name: "Teaching Hospital",
      description: "Medical Education & Training",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">

        <div className="relative max-w-7xl mx-auto px-6 py-24">

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">
              Government General Hospital
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-blue-200">Swami Dayanand Hospital</span>
          </h1>

          <p className="text-xl text-blue-100 mb-8">
            A leading government hospital in East Delhi providing comprehensive
            healthcare services to the community.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-medium flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Book Appointment
            </Link>

            <Link
              to="/contact"
              className="px-8 py-3 border-2 border-white text-white rounded-xl hover:bg-white/10 font-medium flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Contact Us
            </Link>
          </div>

        </div>
      </div>

      {/* INTRODUCTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
              <Hospital className="h-4 w-4" />
              Our Hospital
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Serving East Delhi With Dedication
            </h2>

            <p className="text-gray-600 mb-4">
              Swami Dayanand Hospital is a multi-specialty government hospital
              located in Dilshad Garden, East Delhi. The hospital provides
              affordable and quality healthcare services to thousands of
              patients every day.
            </p>

            <p className="text-gray-600 mb-4">
              The hospital is equipped with modern medical infrastructure and
              experienced doctors across multiple specialties including
              medicine, surgery, orthopedics, gynecology, pediatrics, and
              emergency care.
            </p>

            <p className="text-gray-600">
              Our mission is to ensure that every citizen receives safe,
              ethical, and high-quality treatment regardless of their
              background.
            </p>
          </div>

          <img
            src="data:image/jpeg;base64,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"
            className="w-full h-full max-h-[420px] object-cover rounded-2xl shadow-xl"
            alt="Hospital"
          />

        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 bg-blue-50 rounded-2xl">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-4xl font-bold">{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">

          <div className="bg-white p-8 rounded-xl border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To provide accessible, affordable, and quality healthcare
              services to all.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border-l-4 border-green-600">
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-gray-600">
              To become a center of excellence in government healthcare
              services.
            </p>
          </div>

        </div>
      </section>

      {/* VALUES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow">
              <div className={`p-4 rounded-full inline-block ${v.color}`}>
                {v.icon}
              </div>
              <h3 className="text-xl font-bold mt-4">{v.title}</h3>
              <p className="text-gray-600 mt-2">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FACILITIES */}
      <section className="py-20 bg-blue-700">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6 text-white">
          {facilities.map((f, i) => (
            <div key={i} className="bg-white/10 p-8 rounded-xl">
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Your Health, Our Responsibility
        </h2>

        <Link
          to="/contact"
          className="px-10 py-4 bg-blue-600 text-white rounded-xl inline-flex items-center gap-2"
        >
          Contact Hospital <ChevronRight />
        </Link>
      </section>

    </div>
  );
};

export default About;
