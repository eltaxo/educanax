interface FooterProps {
  contactoProfesor?: string | null;
}

export default function PortalFooter({ contactoProfesor }: FooterProps) {
  return (
    <footer className="border-t bg-gray-50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-2">
          {contactoProfesor && (
            <p className="text-sm text-muted-foreground">
              {contactoProfesor}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Portal Educativo. Plataforma creada para las familias.
          </p>
        </div>
      </div>
    </footer>
  );
}
