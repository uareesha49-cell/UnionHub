import { useNavigate } from "react-router-dom";
import { mediaData } from "../utils/mediaData";

export const Pricing = () => {
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
              <button onClick={() => navigate("/how-it-works")} className="text-gray-700 hover:text-primary font-medium font-nunito transition-colors">
                How It Works
              </button>
              <button onClick={() => navigate("/pricing")} className="text-primary font-bold font-nunito transition-colors underline underline-offset-4">
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
            Pricing Plans For Every Institute
          </h1>
          <p className="text-xl text-gray-600 font-nunito">
            Choose the perfect plan for your institute. Start small, scale big.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-10">
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-2">Starter</h3>
                <p className="text-gray-500 font-nunito mb-6">Perfect for small institutes</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-6xl font-extrabold text-gray-900 font-montserrat">$3</span>
                  <span className="text-gray-500 font-nunito text-xl">/ month</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {[
                    "Up to 50 students",
                    "Up to 10 staff members",
                    "All core features",
                    "Email support",
                    "1GB storage"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">✓</div>
                      <span className="text-gray-700 font-nunito">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate("/signup")} 
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all font-montserrat"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Professional Plan - Featured */}
            <div className="relative bg-primary rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:-translate-y-4">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-6 py-1 font-bold text-sm rounded-bl-xl">
                MOST POPULAR
              </div>
              <div className="p-10 text-white">
                <h3 className="text-2xl font-bold font-montserrat mb-2">Professional</h3>
                <p className="text-blue-200 font-nunito mb-6">For growing institutes</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-6xl font-extrabold font-montserrat">$15</span>
                  <span className="text-blue-200 font-nunito text-xl">/ month</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {[
                    "Up to 500 students",
                    "Up to 50 staff members",
                    "All features including premium",
                    "Priority support",
                    "10GB storage",
                    "Custom reporting",
                    "API access"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</div>
                      <span className="font-nunito">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate("/signup")} 
                  className="w-full bg-white text-primary py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all font-montserrat"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-10">
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-2">Enterprise</h3>
                <p className="text-gray-500 font-nunito mb-6">For large institutions</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-6xl font-extrabold text-gray-900 font-montserrat">Custom</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {[
                    "Unlimited students",
                    "Unlimited staff members",
                    "All features including premium",
                    "24/7 dedicated support",
                    "Unlimited storage",
                    "Custom integrations",
                    "Dedicated account manager",
                    "Custom branding"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">✓</div>
                      <span className="text-gray-700 font-nunito">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate("/signup")} 
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all font-montserrat"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storage Pricing Details */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 font-montserrat mb-4">
              Additional Storage
            </h2>
            <p className="text-xl text-gray-600 font-nunito">
              Need more space? We've got you covered with affordable storage upgrades
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { storage: "10GB", price: "$5/month", description: "Perfect for small institutes" },
              { storage: "50GB", price: "$15/month", description: "Great for growing institutions" },
              { storage: "200GB", price: "$40/month", description: "For large organizations" }
            ].map((plan, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-2">{plan.storage}</h3>
                <p className="text-3xl font-extrabold text-primary font-montserrat mb-4">{plan.price}</p>
                <p className="text-gray-500 font-nunito">{plan.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 font-montserrat mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! All plans come with a 14-day free trial. No credit card required to get started."
              },
              {
                question: "How is storage calculated?",
                answer: "Storage includes all files, documents, images, and data stored in your Union Hub workspace."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 font-montserrat mb-3">{faq.question}</h3>
                <p className="text-gray-600 font-nunito">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white font-montserrat mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-blue-100 font-nunito mb-10">
            Our team is here to help you find the perfect plan for your institute
          </p>
          <button 
            onClick={() => navigate("/signup")} 
            className="bg-white text-primary px-12 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 font-montserrat"
          >
            Contact Our Sales Team
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