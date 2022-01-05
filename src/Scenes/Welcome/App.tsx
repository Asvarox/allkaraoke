import { Link } from 'wouter';

function Welcome() {
    return <>
        <Link href="/game"><a><h1>Game</h1></a></Link>
        <Link href="/convert"><a><h1>Convert UltraStar .txt</h1></a></Link>
    </>
}

export default Welcome;
