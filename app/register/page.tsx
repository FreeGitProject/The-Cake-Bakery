import { Metadata } from 'next'
import RegisterForm from '../../components/RegisterForm'

export const metadata: Metadata = {
  title: 'Register | Cake-Bakery Shop',
  description: 'Create a new account for Cake-Bakery Shop',
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
      <RegisterForm />
    </div>
  )
}

