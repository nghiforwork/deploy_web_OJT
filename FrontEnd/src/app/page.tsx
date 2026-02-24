import Navigation from '@/components/Navigation/navigation';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Home Page</h1>
      <Navigation />
      {/* <nav>
        <ul>
          <li>
            <Link href='/about'>About</Link>
          </li>
          <li>
            <Link href='/contact'>Contact</Link>
          </li>
          <li>
            <Link href='/blog'>Blog</Link>
          </li>
        </ul>
      </nav> */}
    </main>
  );
}
