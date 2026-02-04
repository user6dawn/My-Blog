import React from 'react';
import Layout from '../components/Layout';
import { Mail, Phone, ExternalLink } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Get in Touch</h1>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
          <div className="space-y-4 mb-8">
            <div className="flex items-center">
              <Phone className="text-blue-600 mr-2" size={20} />
              <p className="text-gray-900 dark:text-white"><strong>Phone:</strong> +234 704 222 4426</p>
            </div>
            
            <div className="flex items-center">
              <Mail className="text-blue-600 mr-2" size={20} />
              <p className="text-gray-900 dark:text-white"><strong>Email:</strong> phenomenalafricans@gmail.com</p>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Follow Us @</h3>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="https://youtube.com/@africa-x6f?si=OKKUsX4ouGYEJbeB" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              YouTube <ExternalLink size={16} />
            </a>
            
            <a 
              href="https://www.tiktok.com/@africanfame1?_r=1&_t=ZS-93dHLlrYiDR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              TikTok <ExternalLink size={16} />
            </a>
            
            <a 
              href="https://www.facebook.com/share/1CtJjXsZWa/?mibextid=wwXIfr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Facebook <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
