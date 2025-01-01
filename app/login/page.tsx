import { Metadata } from 'next'
import LoginForm from '../components/LoginForm'

export const metadata: Metadata = {
  title: 'Login | Cake-Bakery Shop',
  description: 'Login to your Cake-Bakery Shop account',
}

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <LoginForm />
    </div>
  )
}

