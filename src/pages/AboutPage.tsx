import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">About Us</h1>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Welcome to <strong>Phinominal African Lives</strong>.
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
            <p className="my-4">
Phinominal African Lives is a storytelling platform dedicated to documenting African lives and the lessons they leave behind.
<br />
We tell stories of Africans past and present, famous and everyday not to idolize them, but to understand the choices they made, the pressures they faced, and the impact they left on others. Some of these lives were loud. Others were quiet. All were human.
<br />
In a world driven by trends, noise, and quick judgment, we slow things down. We focus on meaning over popularity, reflection over reaction, and lessons over headlines. Our stories explore courage, failure, resilience, compromise, integrity, and consequence because real life is complex.
<br />
We believe a life is phenomenal not because it was perfect, but because it influenced someone, challenged something, or left a trace worth remembering. If a story helps you reflect, question, or see life differently, then it has done its work.
<br />
If your life has inspired someone, then you are phenomenal and we celebrate you.
            </p>
            
            {/* <p className="my-4">
              We believe that true peace, strength, and prosperity come when we align our spiritual, physical, and relational lives with the divine structure that governs all things. By understanding and applying these timeless principles, <strong>you can experience:</strong>
            </p>
            
            <ul className="my-6 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✅</span> 
                Healing from emotional, spiritual, and relational struggles
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✅</span> 
                Clarity in leadership, purpose, and decision-making
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✅</span> 
                Stronger, more fulfilling relationships built on divine order
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✅</span> 
                Inner peace and resilience, even in a chaotic world
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✅</span> 
                A prosperous, balanced life rooted in truth
              </li>
            </ul>
            
            <p className="my-4">
              Our mission is to help you unlock the keys to a stable, happy, and prosperous life by teaching the forgotten laws that guide everything—from personal well-being to family, community, and leadership.
            </p>
            
            <p className="my-4">
              Through practical lifestyle principles, deep spiritual wisdom, and time-tested traditions, we provide the tools to break free from disorder and step into the life you were designed to live.
            </p>
            
            <p className="my-4">
              This is more than just a movement—it is a return to the foundation of life itself.
            </p> */}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xl text-gray-900 dark:text-white">
             <b>Are you ready to rediscover balance, purpose, and prosperity?</b> 
            </p>
            <p className="mb-4 text-gray-900 dark:text-white">
              <br />Join the movement today.
            </p>
            <Link 
              to="/contact" 
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium text-lg rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
