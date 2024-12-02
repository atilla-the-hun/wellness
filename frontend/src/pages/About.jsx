import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-white mr-[50px]'>
        <p>ABOUT <span className='text-white font-semibold'>US</span></p>
      </div>

      <div className='my-0 flex flex-col md:flex-row gap-12'>
      <img className='w-full md:max-w-[480px] mb-[42px] mt-10 sm:mt-0' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-white mt-[-50px] sm:mt-0'>
          <p>Welcome to Wellness & Aesthetics, a serene retreat nestled in the heart of Southbroom on the stunning KwaZulu-Natal South Coast. Overlooking the breathtaking Indian Ocean and the golden shores of the beach, our salon offers more than just beauty treatments – it’s a tranquil escape where nature’s beauty and expert care come together.

At Wellness & Aesthetics, we believe in enhancing your natural beauty while providing a relaxing, rejuvenating experience. Whether you’re in need of a soothing facial, a revitalizing massage, a flawless manicure, or a stylish new look, our team of skilled professionals is here to make you feel refreshed, confident, and pampered.

We take pride in creating a welcoming environment where every client feels like family. Our stunning coastal location adds an extra touch of magic to your beauty journey, with the sound of the waves and the cool ocean breeze providing the perfect backdrop to your treatment. Here, you’re not just another appointment; you’re part of the the family Wellness & Aesthetics, where every visit is a step towards self-care and indulgence.

Join us at Wellness & Aesthetics – where beauty meets the sea, and relaxation is just a breeze away.</p>
          <b className='text-white'>Our Vision</b>
          <p>At Wellness & Aesthetics, our vision is to be a sanctuary of beauty and relaxation, where the tranquil rhythms of the Indian Ocean inspire a holistic approach to wellness and self-care. We aim to be the leading beauty destination on the KwaZulu-Natal South Coast, offering exceptional, personalized treatments in an environment that nourishes the body, mind, and soul. Through expert service, a serene atmosphere, and a commitment to sustainable beauty practices, we strive to empower every client to feel confident, rejuvenated, and deeply connected to their own unique beauty.</p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>WHY  <span className='text-white font-semibold'>CHOOSE US</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-white'>
          <b>EFFICIENCY:</b>
          <p>Seamless booking and flexible scheduling designed to fit effortlessly into your busy lifestyle, ensuring your beauty experience is as convenient and stress-free as possible..</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-white'>
          <b>CONVENIENCE: </b>
          <p>A range of trusted beauty and wellness experts at your fingertips, offering personalized services that cater to your unique needs, all in one peaceful coastal location.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-white'>
          <b>PERSONALIZATION:</b>
          <p >Customized beauty treatments and personalized care plans designed to enhance your natural beauty and meet your individual needs, ensuring you always look and feel your best.</p>
        </div>
      </div>

    </div>
  )
}

export default About
