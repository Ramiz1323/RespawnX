import { RouterProvider } from "react-router"
import "./App.css"
import { routes } from "./app.routes"

const App = () => {
  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App