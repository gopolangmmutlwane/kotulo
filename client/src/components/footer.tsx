import { Sprout, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-2xl font-bold text-farm-green mb-4">
              <Sprout className="h-8 w-8" />
              FarmFresh SA
            </div>
            <p className="text-gray-400 mb-4">
              Connecting South African farmers with consumers for fresh, quality produce delivered straight from the farm.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white" data-testid="link-facebook">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" data-testid="link-twitter">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" data-testid="link-instagram">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" data-testid="link-linkedin">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/products/vegetables" className="hover:text-white" data-testid="link-vegetables">Fresh Vegetables</Link></li>
              <li><Link href="/products/meat" className="hover:text-white" data-testid="link-meat">Quality Meat</Link></li>
              <li><Link href="/products/dairy" className="hover:text-white" data-testid="link-dairy">Dairy Products</Link></li>
              <li><Link href="/products" className="hover:text-white" data-testid="link-seasonal">Seasonal Produce</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Farmers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white" data-testid="link-join">Join Our Platform</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-dashboard">Seller Dashboard</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-resources">Resources</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-support">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white" data-testid="link-help">Help Center</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-contact">Contact Us</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-shipping">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-returns">Returns</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FarmFresh SA. All rights reserved. Made with ❤️ for South African farmers.</p>
        </div>
      </div>
    </footer>
  );
}
