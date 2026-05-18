
import MainRoutes from './routes/MainRoutes.tsx'
import { useEffect } from 'react'
import AOS from "aos"
import "aos/dist/aos.css"


import { Toaster } from "@/components/ui/sonner"
const App = () => {
  useEffect(() => {
    AOS.init({ duration: 2000, once: true })
  }, [])
  return (
    <>
      <MainRoutes />
      <Toaster position='top-right' />
    </>
  )
}

export default App