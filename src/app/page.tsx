'use client'

import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import MovieCard from './components/MovieCard'
import Spinner from './components/spinners'
import { useDebounce } from 'react-use'

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
  const [isloading, setisLoading] = useState(false);
  const [debounceSearchTerm, setdebouceSearchTerm] = useState('');
  useDebounce(() => setdebouceSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async(query='') =>  {
    setisLoading(true);
    setErrorMessage('');
try {
    const endPoint = query 
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
     :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;


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
       fetchMovies(debounceSearchTerm);
  },[debounceSearchTerm]);
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
         <h2 className='mt-[40px]'>All Movies</h2>
         {
           isloading?(
           <Spinner />
          ): (
            <ul>
              {
                movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                  //<p className='text-white'>{movie.title}</p>
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
