import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import '@/styles/styles.css'; // Ensure global styles are imported

const ROLES = ['Entrepreneur', 'Stock Trader', 'Coach', 'Speaker', 'Lifelong Learner'];

const LESSONS = [
  { lead: 'Business taught me about', word: 'building.' },
  { lead: 'Investing taught me about', word: 'protecting.' },
  { lead: 'Fitness taught me about', word: 'discipline.' },
  { lead: 'Health challenges taught me about', word: 'paying attention.' },
  { lead: 'Life taught me about', word: 'resilience.' },
];

const body = 'text-lg leading-8 text-zinc-700 dark:text-zinc-300';
const pullQuote =
  'my-10 border-l-4 border-blue-600 pl-6 text-2xl md:text-3xl font-bold tracking-tight leading-snug text-zinc-950 dark:text-white';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <header className="mb-12 md:mb-20 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.95] text-zinc-950 dark:text-white">
            About us
          </h1>
          <h2 className="mt-8 text-2xl md:text-4xl font-bold tracking-tight leading-tight text-zinc-950 dark:text-white">
          Welcome to OnyxeNnaemekasBlog
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:border-t lg:border-zinc-200 dark:lg:border-zinc-800">
                {ROLES.map((role) => (
                  <li
                    key={role}
                    className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 lg:rounded-none lg:border-0 lg:border-b lg:border-zinc-200 lg:px-0 lg:py-4 lg:text-xl lg:font-semibold lg:tracking-tight lg:dark:border-zinc-800"
                  >
                    {role}
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
                35+ Years in Business
              </p>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">Never Written a CV</p>
            </div>
          </aside>

          {/* Story */}
          <article className="lg:col-span-8 max-w-2xl">
            <div className="space-y-6">
              <p className={body}>
                I have spent more than 35 years building businesses, taking risks, making mistakes, starting again, investing, trading, coaching people, and learning what it really takes to build a meaningful and sustainable life.
              </p>

              <p className={body}>
                I have never written or <em>tendard</em> a CV. Not because I have nothing to put on one, but because much of my knowledge came from experience.
              </p>

              <p className={body}>
                Business has been my classroom. Life has been my teacher. Failure has been one of my greatest instructors. And time has taught me lessons that no textbook could.
              </p>

              <p className={body}>
                Over the years, I have been involved in different businesses and ventures, learning firsthand what it means to start with an idea, turn it into something real, deal with people, manage money, survive difficult seasons, adapt when circumstances change, and keep moving forward.
              </p>

              <p className={body}>
                I have also developed a deep interest in investing and the stock market. My journey as an investor and stock trader has taught me that building wealth is not simply about making money. It is about understanding risk, protecting capital, exercising patience, and making decisions based on facts rather than emotion.
              </p>

              <p className={body}>
                But money is only one part of the equation. As I have grown older, my understanding of success has changed. There was a time when I thought success was mainly about how much you could make.
              </p>

              <p className={body}>Today, I believe a more important question is:</p>
            </div>

            <blockquote className={pullQuote}>
              What is the quality of the life you are building with what you have made?
            </blockquote>

            <div className="space-y-6">
              <p className={body}>
                That question became even more personal as I began confronting some of my own health challenges. I have had my own battles with high blood pressure, sinus problems, and neuropathy. These experiences have changed the way I look at health.
              </p>

              <p className={body}>
                I discovered that knowing what is good for you and actually living in a way that supports your health are two very different things. Managing these challenges has made me pay much closer attention to food, exercise, stress, sleep, lifestyle, ageing, and the everyday choices we often take for granted.
              </p>

              <p className={body}>It has also taught me something important:</p>
            </div>

            <blockquote className={pullQuote}>
              Your health is not something you should only think about when something goes wrong.
            </blockquote>

            <div className="space-y-6">
              <p className={body}>Health is something you build every day.</p>

              <p className={body}>
                My experience in the fitness industry has strengthened that belief. As I run Bodyshake Fitness Gym, I have spent years helping people become more active and understand the relationship between exercise, nutrition, and a healthier lifestyle.
              </p>

              <p className={body}>
                But my own journey has reminded me that being involved in fitness does not make you immune to life&apos;s challenges. You can exercise and still have health issues. You can eat carefully and still have things to manage. You can be strong physically and still have areas of your life that require attention.
              </p>

              <p className={body}>
                And that is why I don&apos;t approach health from a position of pretending to have everything figured out. I am still on the journey myself.
              </p>

              <p className={body}>
                My interest today is not simply in living longer. It is in understanding how we can improve our <strong className="text-zinc-950 dark:text-white">healthspan</strong>—the years of our lives in which we can remain active, independent, productive, and engaged.
              </p>

              <p className={body}>
                And this is where my different experiences come together.
              </p>
            </div>

            {/* The five lessons */}
            <ul className="my-10 border-t border-zinc-200 dark:border-zinc-800">
              {LESSONS.map((lesson) => (
                <li
                  key={lesson.word}
                  className="border-b border-zinc-200 py-5 text-xl md:text-2xl font-semibold tracking-tight text-zinc-950 dark:border-zinc-800 dark:text-white"
                >
                  {lesson.lead} {lesson.word}
                </li>
              ))}
            </ul>

            <div className="space-y-6">
              <p className={body}>
                Today, I share what I have learned through all of these experiences. I talk about business, money, investing, personal development, health, fitness, nutrition, ageing, and the realities of the second half of life.
              </p>

              <p className={body}>
                I believe in practical knowledge. I believe in learning from experience. I believe in taking responsibility for the choices we make. And I believe that regardless of where you are today, there is always something you can change, improve, build, or rebuild.
              </p>

              <p className={body}>
                I don&apos;t promise overnight success. I don&apos;t believe in empty hype. I believe in execution, discipline, patience, and continuous learning.
              </p>

              <p className={body}>
                After more than three decades in business and life, I am still learning—and that is precisely why I continue to teach.
              </p>

              <p className={body}>My goal is simple:</p>
            </div>

            <blockquote className={pullQuote}>
              To share what experience has taught me, so you can make better decisions with your money, your business, your health, and your life.
            </blockquote>

            <div className="space-y-6">
              <p className={body}>
                I am not here to tell you that I have mastered life. I am here to tell you what I have learned from living it.
              </p>

              <p className={body}>
                Some lessons came from success. Others came from failure. Some came from making money. Others came from losing money. Some came from building businesses. Others came from watching things I built change or disappear. And some of the most important lessons came from my own body reminding me that wealth means very little if you don&apos;t have the health to enjoy it.
              </p>

              <p className={body}>
                No hype. No pretending to have all the answers. Just lessons from the journey—and the willingness to keep learning.
              </p>
            </div>

            {/* Sign-off */}
            <div className="mt-12 space-y-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
              <p className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Welcome to my world.
              </p>
              <p className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Let&apos;s build better businesses, protect our capital, strengthen our bodies, and make the second half of life count.
              </p>
              <p className="pt-2 text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                — Onyxe Nnaemeka
              </p>
            </div>
          </article>
        </div>

        {/* Call to action */}
        <section className="mt-20 md:mt-28 rounded-3xl bg-zinc-100 px-6 py-14 text-center dark:bg-zinc-900 md:px-12 md:py-20">
          <p className="mx-auto max-w-3xl text-3xl md:text-5xl font-extrabold tracking-tighter leading-tight text-zinc-950 dark:text-white">
            If your life has inspired someone, then you are phenomenal—and we celebrate you.
          </p>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">Join the movement today.</p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-blue-600 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100 dark:focus-visible:ring-offset-zinc-900"
          >
            Get in Touch
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;