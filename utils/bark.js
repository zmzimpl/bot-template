import axios from "axios";
import chalk from "chalk";
import { retry } from "./index.js";

/**
 * Bark 推送工具
 * 用于向 iPhone 发送推送通知
 *
 * Bark 文档: https://github.com/Finb/Bark
 * API 格式: https://api.day.app/{deviceKey}/{title}/{body}?{params}
 */

class BarkNotifier {
  constructor(config) {
    this.enabled = config?.bark?.enabled || false;
    this.serverUrl = config?.bark?.serverUrl || "https://api.day.app";
    this.deviceKey = config?.bark?.deviceKey || "";
    this.sound = config?.bark?.sound || "bell";
    this.level = config?.bark?.level || "timeSensitive";
    this.group = config?.bark?.group || "VaultMonitor";
    this.icon = config?.bark?.icon || "";

    if (this.enabled && !this.deviceKey) {
      console.log(
        chalk.yellow(
          "[Bark] 警告: Bark 已启用但未配置 deviceKey，推送将被禁用"
        )
      );
      this.enabled = false;
    }

    if (this.enabled) {
      console.log(chalk.green("[Bark] ✓ Bark 推送已启用"));
    }
  }

  /**
   * 发送推送通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {object} options - 额外选项
   * @returns {Promise<boolean>} 是否发送成功
   */
  async send(title, body, options = {}) {
    if (!this.enabled) {
      return false;
    }

    try {
      // 构建 URL 参数
      const params = new URLSearchParams({
        call: 1,
        sound: options.sound || this.sound,
        group: options.group || this.group,
        ...(options.url && { url: options.url }),
        ...(options.icon && { icon: options.icon }),
        ...(this.icon && !options.icon && { icon: this.icon }),
        ...(options.badge && { badge: options.badge }),
        ...(options.level && { level: options.level }),
      });

      // 编码标题和内容
      const encodedTitle = encodeURIComponent(title);
      const encodedBody = encodeURIComponent(body);

      // 构建完整 URL
      const url = `${this.serverUrl}/${this.deviceKey}/${encodedTitle}/${encodedBody}?${params.toString()}`;

      // 使用重试机制发送请求
      const response = await retry(
        () =>
          axios.get(url, {
            timeout: 30000, // 30 秒超时
          }),
        3, // 重试 3 次
        2000 // 每次重试间隔 2 秒
      );

      if (response.data.code === 200) {
        console.log(chalk.green(`[Bark] ✓ 推送成功: ${title}`));
        return true;
      } else {
        console.log(
          chalk.yellow(
            `[Bark] 推送失败: ${response.data.message || "未知错误"}`
          )
        );
        return false;
      }
    } catch (error) {
      console.log(chalk.red(`[Bark] 推送错误（已重试 3 次）: ${error.message}`));
      return false;
    }
  }

  /**
   * 发送存款开放通知
   * @param {string} maxDepositAmount - 最大存款限额（USDT）
   * @param {string} minDepositAmount - 最小存款限额（USDT）
   */
  async notifyDepositOpened(maxDepositAmount, minDepositAmount) {
    const title = "🎉 存款已开放！";
    const body = `最大额度: ${maxDepositAmount} USDT\n最小额度: ${minDepositAmount} USDT\n监控已自动触发批量存款`;

    return await this.send(title, body, {
      level: this.level,
      sound: this.sound,
    });
  }

  /**
   * 发送存款关闭通知
   */
  async notifyDepositClosed() {
    const title = "⚠️ 存款已关闭";
    const body = "管理员已将存款限额设置为 0\n监控继续运行，等待下次开放";

    return await this.send(title, body, {
      level: "passive",
    });
  }

  /**
   * 发送批量存款成功通知
   * @param {number} successCount - 成功数量
   * @param {number} totalCount - 总数量
   * @param {string} totalAmount - 总金额（USDT）
   */
  async notifyDepositSuccess(successCount, totalCount, totalAmount) {
    const title = "✅ 批量存款完成";
    const body = `成功: ${successCount}/${totalCount} 个钱包\n总金额: ${totalAmount} USDT`;

    return await this.send(title, body, {
      level: "active",
      sound: "multiwayinvitation",
    });
  }

  /**
   * 发送批量存款部分失败通知
   * @param {number} successCount - 成功数量
   * @param {number} failedCount - 失败数量
   * @param {number} totalCount - 总数量
   */
  async notifyDepositPartialSuccess(successCount, failedCount, totalCount) {
    const title = "⚠️ 批量存款部分成功";
    const body = `成功: ${successCount}\n失败: ${failedCount}\n总计: ${totalCount}`;

    return await this.send(title, body, {
      level: "active",
      sound: "alarm",
    });
  }

  /**
   * 发送批量存款失败通知
   * @param {number} totalCount - 总数量
   * @param {string} reason - 失败原因
   */
  async notifyDepositFailed(totalCount, reason) {
    const title = "❌ 批量存款失败";
    const body = `所有 ${totalCount} 个钱包都失败\n原因: ${reason}`;

    return await this.send(title, body, {
      level: "timeSensitive",
      sound: "alarm",
    });
  }

  /**
   * 发送检测到 Deposit 事件通知（其他用户存款）
   * @param {string} sender - 存款者地址
   * @param {string} amount - 存款金额（USDT）
   */
  async notifyDepositEventDetected(sender, amount) {
    const title = "🔔 检测到存款事件";
    const body = `用户 ${sender.slice(0, 6)}...${sender.slice(-4)} 存入 ${amount} USDT\n自动触发跟单存款`;

    return await this.send(title, body, {
      level: "active",
    });
  }

  /**
   * 发送错误通知
   * @param {string} error - 错误信息
   */
  async notifyError(error) {
    const title = "❌ 监控错误";
    const body = `监控出现异常:\n${error}`;

    return await this.send(title, body, {
      level: "timeSensitive",
      sound: "alarm",
    });
  }

  /**
   * 发送监控启动通知
   * @param {number} walletCount - 监控的钱包数量
   */
  async notifyMonitorStarted(walletCount) {
    const title = "🚀 监控已启动";
    const body = `正在监控 ${walletCount} 个钱包\n等待存款事件触发...`;

    return await this.send(title, body, {
      level: "passive",
    });
  }
}

export { BarkNotifier };
