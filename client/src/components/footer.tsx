import { Sprout, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-2xl font-bold text-secondary mb-4">
              <Sprout className="h-8 w-8" />
              Kotulo
            </div>
            <p className="text-primary-foreground/70 mb-4">
              Connecting South African farmers with consumers for fresh, quality produce delivered straight from the farm.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-secondary">Shop</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><Link href="/products/vegetables" className="hover:text-secondary transition-colors">Fresh Vegetables</Link></li>
              <li><Link href="/products/meat" className="hover:text-secondary transition-colors">Quality Meat</Link></li>
              <li><Link href="/products/dairy" className="hover:text-secondary transition-colors">Dairy Products</Link></li>
              <li><Link href="/products/fruits" className="hover:text-secondary transition-colors">Fresh Fruits</Link></li>
              <li><Link href="/products" className="hover:text-secondary transition-colors">All Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-secondary">For Farmers</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><Link href="/signup" className="hover:text-secondary transition-colors">Join Our Platform</Link></li>
              <li><Link href="/farmer-dashboard" className="hover:text-secondary transition-colors">Farmer Dashboard</Link></li>
              <li><Link href="/b2b" className="hover:text-secondary transition-colors">B2B Ordering</Link></li>
              <li><Link href="/application" className="hover:text-secondary transition-colors">Apply as Farmer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-secondary">Support</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><Link href="/about" className="hover:text-secondary transition-colors">About Kotulo</Link></li>
              <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-secondary transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/70">
          <p>&copy; {new Date().getFullYear()} Kotulo. All rights reserved. Made with ❤️ for South African farmers.</p>
        </div>
      </div>
    </footer>
  );
}
