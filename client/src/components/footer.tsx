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
              <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors" data-testid="link-facebook">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors" data-testid="link-twitter">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors" data-testid="link-instagram">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors" data-testid="link-linkedin">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-secondary">Shop</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><Link href="/products/vegetables" className="hover:text-secondary transition-colors" data-testid="link-vegetables">Fresh Vegetables</Link></li>
              <li><Link href="/products/meat" className="hover:text-secondary transition-colors" data-testid="link-meat">Quality Meat</Link></li>
              <li><Link href="/products/dairy" className="hover:text-secondary transition-colors" data-testid="link-dairy">Dairy Products</Link></li>
              <li><Link href="/products" className="hover:text-secondary transition-colors" data-testid="link-seasonal">Seasonal Produce</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-secondary">For Farmers</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="#" className="hover:text-secondary transition-colors" data-testid="link-join">Join Our Platform</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors" data-testid="link-dashboard">Seller Dashboard</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors" data-testid="link-resources">Resources</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors" data-testid="link-support">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-secondary">Support</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="#" className="hover:text-secondary transition-colors" data-testid="link-help">Help Center</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors" data-testid="link-contact">Contact Us</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors" data-testid="link-shipping">Shipping Info</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors" data-testid="link-returns">Returns</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/70">
          <p>&copy; 2024 Kotulo. All rights reserved. Made with ❤️ for South African farmers.</p>
        </div>
      </div>
    </footer>
  );
}
