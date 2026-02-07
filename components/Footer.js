export default function Footer() {
    return (
        <footer className="p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ContractorCMS. All rights reserved.
        </footer>
    );
}
