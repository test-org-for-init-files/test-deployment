import { useEffect, useState } from 'react'
import axios from 'axios';


const App = () => {
  const [data, setData] = useState('');
  useEffect(() => {
    const gettingBackend = async () => {
      try {
        const res = await axios.get('/api/user')
        console.log(res.data)
        setData(res.data.message)
      } catch (error) {
        console.log('Error', error)
      }
    }
    gettingBackend()

  }, []);
  return (
    <div>{data}
    <h1>Automated Deployment Working!</h1>
    </div>
  )
}

export default App