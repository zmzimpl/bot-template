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
    this.level = config?.bark?.level || "active";
    this.group = config?.bark?.group || "Notifications";
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
   * 发送成功通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {object} options - 额外选项
   * @returns {Promise<boolean>} 是否发送成功
   */
  async success(title, body, options = {}) {
    return await this.send(`✅ ${title}`, body, {
      level: "active",
      sound: "multiwayinvitation",
      ...options,
    });
  }

  /**
   * 发送错误通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {object} options - 额外选项
   * @returns {Promise<boolean>} 是否发送成功
   */
  async error(title, body, options = {}) {
    return await this.send(`❌ ${title}`, body, {
      level: "timeSensitive",
      sound: "alarm",
      ...options,
    });
  }

  /**
   * 发送警告通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {object} options - 额外选项
   * @returns {Promise<boolean>} 是否发送成功
   */
  async warning(title, body, options = {}) {
    return await this.send(`⚠️ ${title}`, body, {
      level: "active",
      sound: "alarm",
      ...options,
    });
  }

  /**
   * 发送信息通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {object} options - 额外选项
   * @returns {Promise<boolean>} 是否发送成功
   */
  async info(title, body, options = {}) {
    return await this.send(`ℹ️ ${title}`, body, {
      level: "passive",
      ...options,
    });
  }
}

export { BarkNotifier };
