import { Github, Cpu, Network, Bot, Zap, MapPin, Clock } from 'lucide-react';

export default function AboutPage() {
  const techStack = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'LangGraph AI Framework',
      description:
        'Advanced multi-agent orchestration system that coordinates specialized AI agents for different tube lines and services.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: 'Multi-Agent Architecture',
      description:
        'Each London Underground line has its own specialized AI agent with deep knowledge of stations, routes, and real-time conditions.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-Time Integration',
      description:
        "Live data feeds from Transport for London's official APIs provide up-to-the-minute service updates and disruption information.",
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Smart Routing',
      description:
        'Intelligent journey planning that considers current service status, accessibility needs, and optimal route suggestions.',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  const features = [
    'Real-time service status for all 11 Underground lines',
    'Journey planning with live disruption awareness',
    'Station information including accessibility details',
    'Weekend engineering work notifications',
    'Voice interaction for hands-free queries',
    'Specialized agents for each tube line',
  ];
  return (
    <div
      className="flex-1 overflow-auto"
      style={{
        background: 'black',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            TFL AI Assistant
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Your intelligent companion for navigating London's Underground
            network, powered by cutting-edge AI technology and real-time
            transport data.
          </p>
        </div>
        {/* What We Do */}{' '}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-400" />
            What We Do
          </h2>
          <div
            className="rounded-xl p-6 border border-gray-700"
            style={{ background: 'rgba(51,51,51,1)' }}
          >
            <p className="text-gray-300 leading-relaxed mb-4">
              The TFL AI Assistant revolutionizes how you interact with London's
              transport network. Instead of navigating complex timetables and
              static maps, simply ask our AI assistant about any aspect of your
              journey in natural language.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Whether you need real-time service updates, journey planning,
              station accessibility information, or weekend engineering work
              details, our specialized AI agents provide instant, accurate
              responses tailored to your specific needs.
            </p>
          </div>
        </div>
        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-green-400" />
            Powered by Advanced AI
          </h2>{' '}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                style={{ background: 'rgba(51,51,51,1)' }}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${tech.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  {tech.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {tech.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Features */}{' '}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            Key Features
          </h2>
          <div
            className="rounded-xl p-6 border border-gray-700"
            style={{ background: 'rgba(51,51,51,1)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Network className="w-6 h-6 text-purple-400" />
            How It Works
          </h2>{' '}
          <div className="space-y-6">
            <div
              className="rounded-xl p-6 border border-gray-700"
              style={{ background: 'rgba(51,51,51,1)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                Multi-Agent Intelligence
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Built on the LangGraph ecosystem, our system employs multiple
                specialized AI agents - one for each Underground line. These
                agents have deep, contextual knowledge about their specific
                routes, stations, and typical service patterns.
              </p>
            </div>

            <div
              className="rounded-xl p-6 border border-gray-700"
              style={{ background: 'rgba(51,51,51,1)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                Real-Time Data Fusion
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Our agents continuously monitor Transport for London's live data
                feeds, combining official service updates with historical
                patterns to provide the most accurate and helpful responses
                possible.
              </p>
            </div>

            <div
              className="rounded-xl p-6 border border-gray-700"
              style={{ background: 'rgba(51,51,51,1)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                Natural Conversation
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Simply type or speak your question naturally. Our AI understands
                context, intent, and can handle follow-up questions, making it
                feel like talking to a knowledgeable local transport expert.
              </p>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Built with modern web technologies for optimal performance
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            This project demonstrates the power of AI agents working together to
            solve real-world transport challenges.
          </p>{' '}
        </div>
      </div>
    </div>
  );
}
