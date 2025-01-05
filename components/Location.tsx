export default function Location() {
  return (
    <section id="location" className="py-16 bg-[#FFD1D1]">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Visit Us</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1752.6056133790903!2d77.38762052489452!3d28.533370126037724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce8a68ffffff1%3A0xaf4867a2327d6c68!2sThe%20Cake%20Shop!5e0!3m2!1sen!2sin!4v1736051994561!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>
          <div className="md:w-1/2 space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-[#FF9494]">Address</h3>
              <p className="text-lg">
                Shop No. A-79, S.K Market
                <br />
                Shramik Kunj, Sector 110, Noida, Uttar Pradesh 201304
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-[#FF9494]">Operating Hours</h3>
              <p className="text-lg">Monday - Friday: 7:00 AM - 8:00 PM</p>
              <p className="text-lg">Saturday: 8:00 AM - 9:00 PM</p>
              <p className="text-lg">Sunday: 9:00 AM - 7:00 PM</p>
            </div>
            <button className="btn-primary">Get Directions</button>
          </div>
        </div>
      </div>
    </section>
  )
}

