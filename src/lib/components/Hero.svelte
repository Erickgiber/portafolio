<section class="pt-24 pb-16 px-4">
  <div class="container mx-auto text-center">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-bold mb-6 text-balance">
        Hola, soy <span class="text-primary">Erick Ramírez</span>
      </h1>
      <p class="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
        Desarrollador Semi-Full Stack de Venezuela, creando experiencias digitales modernas y funcionales
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button onclick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} 
                class="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          Ver mis proyectos
        </button>
        <button onclick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} 
                class="px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium">
          Contactarme
        </button>
      </div>
    </div>
  </div>
</section>
