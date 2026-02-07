interface CourseCardProps {
  title: string;
  image: string;
  senceId?: string;
  duration: string;
  progress: number;
  onClick?: () => void;
}

export function CourseCard({
  title,
  image,
  senceId,
  duration,
  progress,
  onClick,
}: CourseCardProps) {
  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:border-jc-calipso/30 cursor-pointer group"
      onClick={onClick}
    >
      {/* Imagen */}
      <div className="h-40 overflow-hidden relative">
        {senceId && (
          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-white/95 backdrop-blur rounded text-[10px] font-bold text-slate-800">
            SENCE ID: {senceId}
          </div>
        )}
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Contenido */}
      <div className="p-6">
        <h4 className="font-semibold text-slate-800 mb-2 h-12 leading-tight line-clamp-2">
          {title}
        </h4>
        
        <div className="flex items-center text-[10px] text-slate-500 font-semibold mb-4 uppercase tracking-wider">
          <svg className="w-3 h-3 mr-1 text-jc-calipso" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {duration}
        </div>

        {/* Barra de progreso */}
        <div className="flex justify-between items-center">
          <div className="flex-1 mr-4">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-jc-blue rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold text-jc-blue">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
