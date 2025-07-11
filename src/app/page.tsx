'use client'

import React, { useEffect, useState } from 'react'
import Search from './components/Search'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const API_OPTIONS = {
  method: 'GET',
  headers: {
      accept:'application/json',
      Authorization:`Bearer ${API_KEY}`
  }
}

function page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage,setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isloading, setisLoading] = useState(false)

  const fetchMovies = async() =>  {
    setisLoading(true);
    setErrorMessage('');
try {
    const endPoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endPoint, API_OPTIONS);
    if(!response.ok){
      throw new Error('Failed to fetch');
    }
  const data = await response.json();
  if(data.Response === 'False'){
    setErrorMessage(data.Error || 'failed to fetch');
    setMovieList([]);
    return;
  }
  setMovieList(data.results || []);
  } catch (error) {
    console.error(`Error fetching movies ${error}`);
    setErrorMessage('Error fetch movies, please try again');
  } finally{
    setisLoading(false);
  }

  }



  useEffect(() => {
       fetchMovies();
  },[]);
  return (
    <main>
      <div className="pattern"/>
      <div className="wrapper">
        <header>
          <img src="./logo.png" alt="logo"  className="w-24 h-24 object-contain"></img>
          <img src="./hero-img.png" alt="hero"></img>
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm = {searchTerm}  setSearchTerm = {setSearchTerm}/>
        </header>
        <section className='all-movies'>
         <h2>All Movies</h2>
         {
           isloading?(
            <p className='Text-red-500'>Loading....</p>
          ): (
            <ul>
              {
                movieList.map((movie) => (
                  <p className='text-white'>{movie.title}</p>
                ))
              }
            </ul>
          )
         }
        </section>
      </div>
    </main>
  )

}
export default page
