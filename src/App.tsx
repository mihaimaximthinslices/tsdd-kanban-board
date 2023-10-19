import './App.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
function App() {
  const [message, setMessage] = useState<string>('')
  useEffect(() => {
    axios
      .get('/api/hello')
      .then((res) => {
        setMessage(res.data.message)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex w-full justify-center p-4">
        <h1>{message}</h1>
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="font-plusJSans font-bold text-headingXL leading-headingXL">
          Heading (XL)
        </h1>
        <h2 className="font-plusJSans font-bold text-headingL leading-headingL">
          Heading (L)
        </h2>
        <h3 className="font-plusJSans font-bold text-headingM leading-headingM">
          Heading (M)
        </h3>
        <h4 className="font-plusJSans font-bold text-headingS leading-headingS tracking-headingS">
          Heading (S)
        </h4>
        <p className="font-plusJSans font-medium text-bodyL leading-bodyL">
          Body (L) - Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
          Phasellus hendrerit. Pellentesque aliquet nibh nec urna. In nisi
          neque, aliquet vel, dapibus id, mattis vel, nisi. Sed pretium, ligula
          sollicitudin laoreet viverra, tortor libero sodales leo, eget blandit
          nunc tortor eu nibh. Nullam mollis. Ut justo. Suspendisse potenti. Sed
          egestas, ante et vulputate volutpat, eros pede semper est, vitae
          luctus metus libero eu augue. Morbi purus libero, faucibus adipiscing,
          commodo quis, gravida id, est.
        </p>
        <p className="font-plusJSans font-bold text-bodyM leading-bodyM">
          Body (M) - - Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
          Phasellus hendrerit. Pellentesque aliquet nibh nec urna. In nisi
          neque, aliquet vel, dapibus id, mattis vel, nisi. Sed pretium, ligula
          sollicitudin laoreet viverra, tortor libero sodales leo, eget blandit
          nunc tortor eu nibh. Nullam mollis. Ut justo. Suspendisse potenti. Sed
          egestas, ante et vulputate volutpat, eros pede semper est, vitae
          luctus metus libero eu augue. Morbi purus libero, faucibus adipiscing,
          commodo quis, gravida id, est.
        </p>
      </div>
    </div>
  )
}

export default App
