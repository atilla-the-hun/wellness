import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopTreatments from '../components/TopTreatments'
import Banner from '../components/Banner'
import Gallery from '../components/Gallery'
import Team from '../components/Team'

const Home = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="space-y-8 md:space-y-16">
        <SpecialityMenu />
        <Gallery />
        <TopTreatments />
        <Team />
        <Banner />
      </div>
    </div>
  )
}

export default Home
