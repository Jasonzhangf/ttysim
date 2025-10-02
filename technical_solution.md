# TTYSim - 虚拟TTY客户端与多端同步系统技术方案文档

## 1. 项目概述与目标

### 1.1 项目背景
随着远程开发和分布式协作的普及，开发者需要更高效的终端管理工具。传统的终端复用器如Tmux虽然功能强大，但在远程协作和跨设备访问方面存在局限性。本项目旨在构建一个现代化的虚拟TTY客户端，支持类似Tmux的会话管理功能和跨设备实时同步能力。

### 1.2 项目目标
开发一个虚拟TTY客户端系统，主要目标包括：
- 提供类似Tmux的虚拟TTY会话管理体验
- 实现动态分辨率协商和智能重排机制
- 支持多设备（PC、移动端、Web端）实时同步
- 确保所有客户端看到完全一致的TTY内容
- 提供设备特定的交互适配（快捷键、虚拟键盘、手势等）
- 确保数据传输的安全性和可靠性

### 1.3 核心创新
- **动态分辨率协商**: 基于最小分辨率原则的智能重排
- **显示内容一致性**: 所有客户端看到完全相同的TTY界面
- **交互方式适配**: 不同设备使用最适合的交互方式
- **服务端重排引擎**: 智能的TTY应用动态调整机制

## 2. 核心技术原理

### 2.1 TTY应用重排机制
TTY应用（如vim、top、htop等）具有动态调整能力：
```bash
# 当TTY尺寸改变时，应用会：
1. 接收到SIGWINCH信号
2. 重新调用 ioctl() 获取新尺寸
3. 重新计算和布局：
   - 窗口分割位置
   - 文本折行边界
   - 光标移动坐标
   - 滚动区域范围
4. 重新渲染整个界面
```

### 2.2 动态分辨率协商策略
```
分辨率协商规则:
┌─────────────────┬─────────────────────────────────┐
│ 客户端数量      │ 目标分辨率策略                   │
├─────────────────┼─────────────────────────────────┤
│ 1个客户端       │ 使用该客户端的分辨率             │
├─────────────────┼─────────────────────────────────┤
│ 多个客户端      │ 使用最小分辨率（所有客户端兼容） │
├─────────────────┼─────────────────────────────────┤
│ 客户端离开      │ 重新计算并重排                   │
└─────────────────┴─────────────────────────────────┘
```

### 2.3 显示与交互分离架构
```
显示层 (完全一致):
PC端显示 ←→ 手机端显示 ←→ Web端显示
     ↓           ↓           ↓
  相同的TTY内容 (120x30缩放) (40x15完整)

交互层 (设备适配):
PC端: 键盘快捷键 + 鼠标操作
手机端: 虚拟键盘 + 触摸手势 + 专用按钮
Web端: 键盘 + 鼠标 + Web特有控件
```

## 3. 系统架构设计

### 3.1 整体架构图
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                客户端层                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  桌面客户端  │  │  移动客户端  │  │   Web客户端  │  │   CLI客户端  │        │
│  │(Electron)   │  │(React Native)│  │ (React.js)   │  │ (Node.js)   │        │
│  │- 键盘交互    │  │- 触摸手势    │  │- 键盘+鼠标   │  │- 命令行交互  │        │
│  │- 完整显示    │  │- 虚拟键盘    │  │- 缩放显示    │  │- 纯文本显示  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────────────────────┤
│                           WebSocket实时通信层                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                             TTYSim服务端                                   │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │ 分辨率协商管理器 │  虚拟TTY引擎     │  显示同步引擎     │  交互适配引擎     │  │
│  │ResolutionMgr    │ VirtualTTYEngine │ DisplaySync    │ InteractionAdapt│  │
│  │- 最小分辨率计算  │- TTY应用管理     │- 内容广播       │- 输入转换       │  │
│  │- 动态重排触发    │- SIGWINCH处理    │- 状态同步       │- 设备特化       │  │
│  │- 客户端协商      │- 重排完成检测    │- 一致性保证     │- 手势映射       │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              底层虚拟化层                                  │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │  伪终端管理      │  进程管理器       │  状态管理器       │  事件管理器       │  │
│  │   PTY Manager   │ ProcessManager  │ StateManager   │ EventManager   │  │
│  │- node-pty集成   │- 进程生命周期    │- 会话状态       │- 事件分发       │  │
│  │- 尺寸调整       │- 信号处理        │- 缓冲区管理     │- 异步处理       │  │
│  │- 信号转发       │- 资源清理        │- 持久化        │- 错误恢复       │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              基础设施层                                    │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │   数据库        │   缓存系统       │   消息队列       │  文件系统        │  │
│  │ PostgreSQL      │    Redis        │   EventEmitter  │ Local FS        │  │
│  │- 会话数据       │- 状态缓存       │- 实时事件       │- 日志存储       │  │
│  │- 用户信息       │- 性能优化       │- 异步通信       │- 配置管理       │  │
│  │- 权限管理       │- 分布式同步     │- 事件广播       │- 临时文件       │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 核心模块设计

#### 3.2.1 分辨率协商管理器
```typescript
interface ResolutionNegotiationManager {
  // 客户端加入时的协商逻辑
  clientJoined(sessionId: string, client: Client): Promise<void>;

  // 客户端离开时的重新协商
  clientLeft(sessionId: string, clientId: string): Promise<void>;

  // 计算目标分辨率
  calculateTargetResolution(session: TTYSimSession): Resolution;

  // 触发TTY重排
  reflowTTY(session: TTYSimSession, newResolution: Resolution): Promise<void>;

  // 分辨率变更通知
  notifyResolutionChange(session: TTYSimSession, resolution: Resolution): Promise<void>;
}

// 协商策略实现
class ResolutionNegotiationStrategy {
  calculateTargetResolution(clients: Client[]): Resolution {
    if (clients.length === 0) {
      return { cols: 80, rows: 24 }; // 默认分辨率
    }

    if (clients.length === 1) {
      return clients[0].preferredResolution; // 单客户端策略
    }

    // 多客户端：使用最小分辨率
    const minCols = Math.min(...clients.map(c => c.preferredResolution.cols));
    const minRows = Math.min(...clients.map(c => c.preferredResolution.rows));
    return { cols: minCols, rows: minRows };
  }
}
```

#### 3.2.2 虚拟TTY引擎
```typescript
interface VirtualTTTEngine {
  // 创建虚拟TTY会话
  createSession(config: SessionConfig): Promise<TTYSimSession>;

  // 调整TTY分辨率
  resizeSession(sessionId: string, resolution: Resolution): Promise<void>;

  // 监听TTY输出
  onOutput(sessionId: string, callback: (data: Buffer) => void): void;

  // 发送输入到TTY
  sendInput(sessionId: string, input: string): Promise<void>;
}

// TTY应用重排实现
class ReflowableTTYApplication {
  private process: ChildProcess;
  private currentResolution: Resolution;

  async resize(newResolution: Resolution): Promise<void> {
    // 1. 更新环境变量
    this.process.env.COLUMNS = newResolution.cols.toString();
    this.process.env.LINES = newResolution.rows.toString();

    // 2. 发送SIGWINCH信号
    this.process.kill('SIGWINCH');

    // 3. 调整PTY大小
    if (this.process.pty) {
      await this.process.pty.resize(newResolution.cols, newResolution.rows);
    }

    // 4. 等待重排完成
    await this.waitForRerenderCompletion();
  }

  private async waitForRerenderCompletion(): Promise<void> {
    return new Promise((resolve) => {
      let outputBuffer = '';
      const timeout = setTimeout(() => resolve(), 500);

      const onData = (data: Buffer) => {
        outputBuffer += data.toString();
        if (this.detectRerenderCompletion(outputBuffer)) {
          clearTimeout(timeout);
          this.process.stdout?.removeListener('data', onData);
          resolve();
        }
      };

      this.process.stdout?.on('data', onData);
    });
  }
}
```

#### 3.2.3 交互适配引擎
```typescript
interface InteractionAdapter {
  // 处理客户端输入
  handleClientInput(clientId: string, input: ClientInput): Promise<TTYInput[]>;

  // 获取客户端UI组件
  getClientUIComponents(clientType: ClientType): UIComponent[];

  // 转换设备特定操作为TTY命令
  adaptInputForTTY(input: ClientInput, deviceType: ClientType): TTYInput[];
}

// 移动端适配器
class MobileInteractionAdapter implements InteractionAdapter {
  handleClientInput(input: MobileInput): TTYInput[] {
    switch (input.type) {
      case 'swipe':
        return this.handleSwipe(input.direction);
      case 'tap':
        return this.handleTap(input.position);
      case 'virtualKeyboard':
        return this.handleVirtualKeyboard(input.text);
      case 'buttonPress':
        return this.handleButtonPress(input.buttonId);
    }
  }

  private handleSwipe(direction: SwipeDirection): TTYInput[] {
    // 手势到vim命令的映射
    const gestureMap = {
      'up': 'k',
      'down': 'j',
      'left': 'h',
      'right': 'l'
    };
    return [{ type: 'key', value: gestureMap[direction] }];
  }

  getClientUIComponents(): UIComponent[] {
    return [
      new VirtualButton('保存', ':w'),
      new VirtualButton('退出', ':q'),
      new VirtualButton('撤销', 'u'),
      new VirtualKeyboard(),
      new GestureGuide()
    ];
  }
}

// 桌面端适配器
class DesktopInteractionAdapter implements InteractionAdapter {
  handleClientInput(input: KeyboardInput): TTYInput[] {
    // 直接转发键盘输入
    return [{ type: 'key', value: input.key, modifiers: input.modifiers }];
  }

  getClientUIComponents(): UIComponent[] {
    return [
      new KeyboardShortcut('Ctrl+S', ':w'),
      new KeyboardShortcut('Ctrl+Q', ':q'),
      new MenuBar()
    ];
  }
}
```

## 4. 技术选型

### 4.1 后端技术栈
- **运行时**: Node.js 18+ (LTS)
- **框架**: Fastify (高性能Web框架)
- **WebSocket**: Socket.IO (实时通信)
- **PTY管理**: node-pty (伪终端接口)
- **进程管理**: child_process (原生进程管理)
- **数据库**: PostgreSQL (主数据) + Redis (缓存)
- **类型系统**: TypeScript (类型安全)

### 4.2 前端技术栈
- **Web客户端**: React 18 + TypeScript + Xterm.js
- **桌面客户端**: Electron + React (基于Electerm优化)
- **移动客户端**: React Native + TypeScript
- **CLI客户端**: Commander.js + Node.js

### 4.3 开发工具
- **包管理**: pnpm (前端) + npm (后端)
- **构建工具**: Vite (前端) + tsc (后端)
- **测试框架**: Vitest (前端) + Jest (后端)
- **代码质量**: ESLint + Prettier + Husky

## 5. 开发计划

### 5.1 第一阶段：核心架构搭建 (第1-4周)

#### 第1周：项目初始化与基础框架
- 搭建Monorepo项目结构
- 配置TypeScript、ESLint、Prettier
- 实现基础的WebSocket通信
- 建立CI/CD流程

#### 第2周：虚拟TTY引擎开发
- 集成node-pty，实现基础PTY管理
- 开发TTY进程生命周期管理
- 实现基础的输入输出处理
- 添加信号处理机制

#### 第3周：分辨率协商系统
- 实现分辨率协商管理器
- 开发动态重排机制
- 添加SIGWINCH信号处理
- 实现重排完成检测

#### 第4周：多客户端支持
- 实现客户端连接管理
- 开发显示内容同步机制
- 添加客户端状态跟踪
- 完成基础的多端同步测试

### 5.2 第二阶段：客户端开发 (第5-8周)

#### 第5周：Web客户端开发
- 基于React + Xterm.js构建Web界面
- 实现WebSocket连接管理
- 开发基础的TTY显示功能
- 添加响应式布局支持

#### 第6周：移动端适配
- 开发移动端交互适配器
- 实现触摸手势支持
- 添加虚拟键盘功能
- 优化小屏幕显示体验

#### 第7周：桌面端集成
- 基于Electerm优化桌面客户端
- 实现键盘快捷键支持
- 添加本地配置管理
- 完善桌面端用户体验

#### 第8周：CLI客户端
- 开发命令行界面
- 实现纯文本TTY显示
- 添加脚本化操作支持
- 完成所有客户端集成测试

### 5.3 第三阶段：高级功能 (第9-12周)

#### 第9周：交互适配优化
- 完善各种设备的交互适配
- 开发智能手势识别
- 添加自定义快捷键支持
- 优化用户体验细节

#### 第10周：性能优化
- 优化WebSocket通信性能
- 实现增量更新机制
- 添加内容压缩传输
- 优化内存使用和CPU占用

#### 第11周：安全机制
- 实现用户认证系统
- 添加端到端加密
- 开发权限管理机制
- 完善安全审计功能

#### 第12周：测试与发布
- 完整的端到端测试
- 性能压力测试
- 安全漏洞扫描
- 准备1.0版本发布

### 5.4 关键里程碑

| 里程碑 | 时间 | 目标 | 交付物 |
|--------|------|------|--------|
| M1 | 第4周末 | 核心架构完成 | 可运行的多端TTY同步原型 |
| M2 | 第8周末 | 客户端完善 | 支持Web、移动、桌面端的完整系统 |
| M3 | 第12周末 | 生产就绪 | 可发布的1.0版本 |

## 6. 关键技术挑战与解决方案

### 6.1 TTY应用重排可靠性
**挑战**: 确保TTY应用在分辨率变化时正确重排
**解决方案**:
- 实现多重检测机制（SIGWINCH + 输出检测 + 超时机制）
- 添加应用特定的重排完成识别
- 提供重排失败时的回退机制

### 6.2 多客户端状态一致性
**挑战**: 确保所有客户端看到完全相同的内容
**解决方案**:
- 服务端权威的单点内容管理
- 基于序列号的冲突检测机制
- 实时状态同步和验证

### 6.3 交互体验优化
**挑战**: 不同设备的交互体验差异
**解决方案**:
- 设备特定的交互适配器
- 智能的手势和快捷键映射
- 可配置的交互方式

### 6.4 性能优化
**挑战**: 实时同步的性能要求
**解决方案**:
- 增量更新和差分传输
- 智能的内容缓存机制
- 自适应的传输频率控制

## 7. 风险评估与应对策略

### 7.1 技术风险
- **PTY兼容性**: 不同操作系统的PTY实现差异
- **应用重排**: 某些TTY应用可能不支持动态重排
- **性能瓶颈**: 大量客户端同时连接的性能问题

### 7.2 用户体验风险
- **延迟感知**: 实时同步的网络延迟影响
- **交互复杂度**: 不同设备的学习成本
- **功能限制**: 相比本地TTY的功能限制

### 7.3 应对策略
- 建立完善的测试矩阵，覆盖不同操作系统和TTY应用
- 实现智能的降级机制，确保基本功能可用
- 提供详细的用户文档和交互指南

## 8. 总结

本技术方案基于对TTY应用本质的深刻理解，提出了**动态分辨率协商 + 显示内容一致性 + 交互方式适配**的创新架构。通过服务端智能重排和多端协同，既保证了TTY应用的正常运行，又实现了真正的跨设备无缝协作体验。

该方案的核心优势在于：
- **技术可行性**: 基于TTY应用的标准重排机制
- **用户体验**: 显示内容完全一致，交互方式设备优化
- **扩展性**: 支持任意数量和类型的客户端
- **可靠性**: 完善的错误处理和降级机制

通过分阶段的开发计划，可以逐步实现这个创新的虚拟TTY客户端系统，为远程协作开发提供强有力的工具支持。