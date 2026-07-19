import { useNavigate } from "react-router-dom";
import { mediaData } from "../utils/mediaData";

export const Landing = () => {
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
              <button onClick={() => navigate("/")} className="text-primary font-bold font-nunito transition-colors underline underline-offset-4">
                Home
              </button>
              <button onClick={() => navigate("/how-it-works")} className="text-gray-700 hover:text-primary font-medium font-nunito transition-colors">
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
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
           
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 font-montserrat mb-8 leading-tight">
              Transform Your Institute with <br />
              <span className="text-primary">
                Union Hub
              </span>
            </h1>
            <p className="text-xl text-gray-600 font-nunito max-w-5xl mx-auto mb-12 leading-relaxed">
              The all-in-one platform designed to simplify every aspect of educational institute management.
              From student records to staff salaries, meetings to fee management - we've got you covered with
              an elegant, intuitive interface.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate("/signup")} 
                className="bg-primary text-white px-10 py-4 rounded-full text-xl font-semibold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 font-montserrat"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => navigate("/how-it-works")} 
                className="border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-full text-xl font-semibold hover:border-blue-500 hover:text-primary transition-all font-montserrat"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            
            <h2 className="text-5xl font-bold text-gray-900 font-montserrat mb-6">
              Everything You Need, In One Place
            </h2>
            <p className="text-xl text-gray-600 font-nunito max-w-2xl mx-auto">
              Union Hub provides all the tools you need to run your institute smoothly and efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: mediaData.Dashboard,
                title: "Intuitive Dashboard",
                description: "Get a complete overview of your institute's operations at a single glance"
              },
              {
                icon: mediaData.Employees,
                title: "Staff Management",
                description: "Manage teacher, staff records, payroll, and contracts with ease"
              },
              {
                icon: mediaData.Employees,
                title: "Student Portal",
                description: "Students can view fees, grades, and updates in their personalized dashboard"
              },
              {
                icon: mediaData.Meetings,
                title: "Meeting Scheduler",
                description: "Schedule and track meetings with staff and parents effortlessly"
              },
              {
                icon: mediaData.News,
                title: "News & Updates",
                description: "Keep everyone informed with real-time announcements and news"
              },
              {
                icon: mediaData.Faq,
                title: "FAQ Management",
                description: "Create and manage FAQs for students and staff"
              },
              {
                icon: mediaData.Vote,
                title: "Voting System",
                description: "Conduct polls and voting for important decisions"
              },
              {
                icon: mediaData.Notifications,
                title: "Instant Notifications",
                description: "Send and receive important updates via email notifications"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-gradient-to-b from-gray-50 to-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                  <img src={feature.icon} alt={feature.title} className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-montserrat mb-3">{feature.title}</h3>
                <p className="text-gray-600 font-nunito leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            
            <h2 className="text-5xl font-bold text-gray-900 font-montserrat mb-6">
              Get Started In 3 Simple Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up Your     Institute for managing properly",
                description: "Create your account in seconds and set up your institute profile"
              },
              {
                step: "02",
                title: "Add Your Team & Students",
                description: "Invite your staff and students to join your Union Hub workspace"
              },
              {
                step: "03",
                title: "Start Managing Efficiently",
                description: "Begin using all the powerful tools to streamline your operations"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -top-6 -left-6 text-9xl font-extrabold text-blue-100 font-montserrat">
                  {item.step}
                </div>
                <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-4">{item.title}</h3>
                  <p className="text-gray-600 font-nunito">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate("/how-it-works")} 
              className="text-primary font-semibold text-lg hover:text-blue-700 transition-colors font-nunito"
            >
              View complete guide →
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
           
            <h2 className="text-5xl font-bold text-gray-900 font-montserrat mb-6">
              Plans Designed For Every Institute
            </h2>
            <p className="text-xl text-gray-600 font-nunito max-w-2xl mx-auto">
              Start small, scale big. Our pricing grows with your institute.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-primary p-1 rounded-3xl shadow-2xl">
              <div className="bg-white p-10 rounded-3xl">
                <h3 className="text-3xl font-bold text-gray-900 font-montserrat mb-2">Starter Plan</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-extrabold text-gray-900 font-montserrat">$3</span>
                  <span className="text-gray-500 font-nunito text-xl">/ month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Up to 50 students",
                    "Up to 10 staff members",
                    "All core features",
                    "Email support"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-primary text-sm font-bold">✓</div>
                      <span className="text-gray-700 font-nunito">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate("/pricing")} 
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all font-montserrat"
                >
                  View All Pricing Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 font-montserrat mb-6">
              Trusted By Educators Everywhere
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "School Principal",
                quote: "Union Hub has transformed how we manage our school. Everything is now organized and accessible in one place!"
              },
              {
                name: "Michael Chen",
                role: "IT Administrator",
                quote: "The platform is incredibly easy to use and the support team is always there when we need them."
              },
              {
                name: "Emily Rodriguez",
                role: "Finance Manager",
                quote: "Managing payroll and fees has never been simpler. Union Hub saves us hours every week!"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <p className="text-gray-600 italic font-nunito mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl font-montserrat">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-montserrat">{testimonial.name}</h4>
                    <p className="text-gray-500 font-nunito text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white font-montserrat mb-6">
            Ready to Transform Your Institute?
          </h2>
          <p className="text-xl text-blue-100 font-nunito mb-10 max-w-2xl mx-auto">
            Join thousands of educational institutions already using Union Hub to streamline their operations
          </p>
          <button 
            onClick={() => navigate("/signup")} 
            className="bg-white text-primary px-12 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 font-montserrat"
          >
            Start Your Free Trial Today
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
              <p className="text-gray-400 font-nunito">areeshaumar44@gmail.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 font-nunito">
            <p>© 2026 Union Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
