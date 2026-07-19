import { useNavigate } from "react-router-dom";
import { mediaData } from "../utils/mediaData";

export const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <img src={mediaData.Logo} alt="Union Hub Logo" className="w-12 h-12 rounded-full" />
              <span className="text-2xl font-bold text-primary font-montserrat">
                Union Hub
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate("/")} className="text-gray-700 hover:text-primary font-medium font-nunito transition-colors">
                Home
              </button>
              <button onClick={() => navigate("/how-it-works")} className="text-primary font-bold font-nunito transition-colors underline underline-offset-4">
                How It Works
              </button>
              <button onClick={() => navigate("/pricing")} className="text-gray-700 hover:text-primary font-medium font-nunito transition-colors">
                Pricing
              </button>
            </nav>
            <button 
              onClick={() => navigate("/login")} 
              className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-montserrat"
            >
              Login Your Institute
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
         
          <h1 className="text-5xl font-extrabold text-gray-900 font-montserrat mb-6">
            How Union Hub Works
          </h1>
          <p className="text-xl text-gray-600 font-nunito">
            Get up and running in minutes with our simple, intuitive platform
          </p>
        </div>
      </section>

      {/* Main Steps */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {/* Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-montserrat">
                    1
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 font-montserrat">
                    Create Your Institute Account
                  </h2>
                </div>
                <p className="text-lg text-gray-600 font-nunito mb-6 leading-relaxed">
                  Sign up for Union Hub in less than a minute. Just provide your institute name,
                  email, and create a secure password. You'll be ready to start setting up your
                  workspace immediately.
                </p>
                <ul className="space-y-3">
                  {["Fast and simple sign up process", "Secure authentication", "Free trial available", "No credit card required"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">✓</div>
                      <span className="text-gray-700 font-nunito">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 flex items-center justify-center">
                <img src={mediaData.Rightimage} alt="Sign up" className="w-full max-w-md" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 flex items-center justify-center">
                <img src={mediaData.Employees} alt="Add your team" className="w-full max-w-md" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-montserrat">
                    2
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 font-montserrat">
                    Add Your Staff & Students
                  </h2>
                </div>
                <p className="text-lg text-gray-600 font-nunito mb-6 leading-relaxed">
                  Invite your teachers, administrative staff, and students to join your Union Hub
                  workspace. Each user gets their own personalized dashboard with role-specific
                  permissions and features.
                </p>
                <ul className="space-y-3">
                  {["Role-based access control", "Easy invitation system", "Personalized dashboards", "Bulk import available"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">✓</div>
                      <span className="text-gray-700 font-nunito">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-montserrat">
                    3
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 font-montserrat">
                    Customize Your Workspace
                  </h2>
                </div>
                <p className="text-lg text-gray-600 font-nunito mb-6 leading-relaxed">
                  Set up your fee structures, payroll, meeting schedules, and more. Union Hub
                  is highly customizable to fit the unique needs of your institute.
                </p>
                <ul className="space-y-3">
                  {["Customizable fee structures", "Payroll configuration", "Meeting room management", "FAQ and announcement setup"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">✓</div>
                      <span className="text-gray-700 font-nunito">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 flex items-center justify-center">
                <img src={mediaData.Dashboard} alt="Customize workspace" className="w-full max-w-md" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-3xl p-8 flex items-center justify-center">
                <img src={mediaData.News} alt="Start managing" className="w-full max-w-md" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-montserrat">
                    4
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 font-montserrat">
                    Start Managing Efficiently
                  </h2>
                </div>
                <p className="text-lg text-gray-600 font-nunito mb-6 leading-relaxed">
                  You're all set! Start using all of Union Hub's powerful features to streamline
                  your institute's operations, improve communication, and save valuable time.
                </p>
                <ul className="space-y-3">
                  {["Real-time notifications", "Automated workflows", "Comprehensive reports", "24/7 support"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">✓</div>
                      <span className="text-gray-700 font-nunito">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white font-montserrat mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 font-nunito mb-10">
            Join thousands of educational institutions already using Union Hub
          </p>
          <button 
            onClick={() => navigate("/signup")} 
            className="bg-white text-primary px-12 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 font-montserrat"
          >
            Start Your Free Trial Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={mediaData.Logo} alt="Union Hub Logo" className="w-10 h-10 rounded-full" />
                <span className="text-2xl font-bold font-montserrat">Union Hub</span>
              </div>
              <p className="text-gray-400 font-nunito mb-6 max-w-md">
                The all-in-one platform for educational institute management. Simplify your operations,
                improve communication, and focus on what matters most - education.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold font-montserrat mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><button onClick={() => navigate("/")} className="text-gray-400 hover:text-white font-nunito transition-colors">Home</button></li>
                <li><button onClick={() => navigate("/how-it-works")} className="text-gray-400 hover:text-white font-nunito transition-colors">How It Works</button></li>
                <li><button onClick={() => navigate("/pricing")} className="text-gray-400 hover:text-white font-nunito transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate("/login")} className="text-gray-400 hover:text-white font-nunito transition-colors">Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold font-montserrat mb-6">Contact Us</h4>
              <p className="text-gray-400 font-nunito">support@unionhub.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 font-nunito">
            <p>© 2025 Union Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};