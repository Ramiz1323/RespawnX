import { useEffect } from "react"
import { RouterProvider } from "react-router"
import "./App.scss"
import { routes } from "./app.routes"
import { useAuth } from "../features/auth/hook/useAuth"
import { useCart } from "../features/cart/hook/useCart"

const App = () => {
  const { handleGetMe } = useAuth()
  const { handleGetCart } = useCart()

  useEffect(() => {
    const initSession = async () => {
      const user = await handleGetMe()
      if (user) {
        handleGetCart().catch(() => {})
      }
    }
    initSession()
  }, [])

  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App