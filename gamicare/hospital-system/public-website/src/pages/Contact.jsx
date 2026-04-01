import React, { useState } from 'react';
import {
  Phone, Mail, MapPin, Clock,
  Send, AlertTriangle,
  MessageSquare, User, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Contact = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });


  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://formspree.io/f/mjgeozbg", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          _replyto: formData.email,
          _subject: `New Contact Form: ${formData.subject}`
        })
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      toast.error("Network error!");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATED HOSPITAL INFO ================= */

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Hospital Contact",
      details: ["+91 11 2258 8585"],
      description: "Open 24 Hours",
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Address",
      details: ["info@swamidayanandhospital.in"],
      description: "Response within 24 hours",
      color: "bg-green-50 text-green-600 border-green-100"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Hospital Address",
      details: [
        "M8H3+978, Shahdara North Zone",
        "C-Block, Dilshad Garden",
        "New Delhi, Delhi 110095, India",
        "Adjacent Landmark: IHBAS cum GTBH"
      ],
      description: "Main Government Hospital",
      color: "bg-red-50 text-red-600 border-red-100"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Working Hours",
      details: ["Open 24 Hours", "All Days"],
      description: "Emergency Services Available",
      color: "bg-purple-50 text-purple-600 border-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-white py-12">

      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Swami Dayanand <span className="text-white">Hospital</span>
          </h1>

          <p className="text-gray-50 text-lg">
            Government General Hospital – Delhi, India
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SIDE INFO */}
          <div className="space-y-6">

            {contactInfo.map((info, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg p-6 border ${info.color}`}
              >
                <div className="flex gap-4">
                  <div className="p-3 rounded-xl bg-opacity-20">
                    {info.icon}
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">{info.title}</h3>
                    {info.details.map((d, i) => (
                      <p key={i} className="text-gray-600">{d}</p>
                    ))}
                    <p className="text-sm mt-3">{info.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* EMERGENCY BANNER */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white shadow-lg">

              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle />
                <h3 className="text-xl font-bold">Emergency Contact</h3>
              </div>

              <p className="mb-6">
                Call immediately for medical emergencies
              </p>

              <a
                href="tel:+911122588585"
                className="flex justify-center gap-3 px-6 py-4 bg-white text-red-700 rounded-xl font-bold text-xl"
              >
                <Phone /> +91 11 2258 8585
              </a>

            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-xl p-8">

              <div className="flex gap-3 mb-8">
                <MessageSquare className="text-blue-600" />
                <h2 className="text-2xl font-bold">Send Us a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">

                  <input
                    placeholder="Your Name"
                    className="input"
                    value={formData.name}
                    onChange={(e)=>setFormData({...formData,name:e.target.value})}
                    required
                  />

                  <input
                    placeholder="Email"
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e)=>setFormData({...formData,email:e.target.value})}
                    required
                  />

                </div>

                <input
                  placeholder="Subject"
                  className="input"
                  value={formData.subject}
                  onChange={(e)=>setFormData({...formData,subject:e.target.value})}
                  required
                />

                <textarea
                  placeholder="Message"
                  className="input min-h-[180px]"
                  value={formData.message}
                  onChange={(e)=>setFormData({...formData,message:e.target.value})}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex justify-center gap-3"
                >
                  {loading ? "Sending..." : <>Send Message <Send /></>}
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Contact;
